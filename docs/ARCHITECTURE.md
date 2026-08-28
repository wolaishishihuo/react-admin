# 架构契约

本文只描述已经落地的契约，不记录迁移过程。任务明确改变行为时同步更新实现、测试和本文档；其他不一致按 `AGENTS.md` 的裁决流程处理。

## 目录与依赖方向

```text
src/pages            文件路由：URL、布局边界、页面 owner
src/layouts          Admin 壳：当前只有一套后台布局，所以平铺；将来第二套大型布局再拆 layouts/admin、layouts/portal
src/router           单例 router、守卫、routeTree.gen.ts
src/features/auth    登录 API、user Query、session
src/features/navigation  菜单生成、规范化、权限 hook
src/features/theme   ThemeEffects、tokens、切换动画
src/services/http    Axios 客户端、信封解包、401、取消
src/services/query   QueryClient 单例
src/stores/modules   仅客户端状态：session/theme/admin-layout/tabs/search-history
src/components       模板公共 UI
src/hooks            跨页面 React/Ant Design 行为
src/utils            纯函数：date/download/tree/validate/color/form-rule/url
src/app              AntdBridge + feedback
build                Vite mock、插件、代理、env 解析
tests                Vitest unit + Playwright e2e
```

禁止：feature 导入 page；HTTP 静态导入完整 auth；Zustand 复制 user/menu。

## 路由

文件如何变成 URL、如何加页面、身份模型和运行时用法见 `docs/ROUTING.md`。本节只列契约。

- Vite plugin：`routesDirectory: ./src/pages`，`generatedRouteTree: ./src/router/routeTree.gen.ts`，`routeToken: 'layout'`，`autoCodeSplitting: true`。忽略 `components/`、`modules/` 以及名为 `loading` / `error` / `not-found` 的文件。
- `routeTree.gen.ts` 禁止手改，必须提交；`pnpm routes:check` 用 git diff 防漂移。`routes:generate` 实际是一次 `vite build --mode development`。
- `(admin)` / `(auth)` / `(errors)` 只分组，不进入 URL。
- `VITE_ROUTER_MODE` 选择 hash / history。首页 `/home`，登录 `/login`。
- search 使用 `URLSearchParams` 而非 Router 默认 JSON 序列化，避免 `id=1` 变成 `id=%221%22`。
- 跨模块跳转走 `navigateTo`（`history.push`），避免缓存 pane 内 `useNavigate` 写到静态 snapshot store。
- `VITE_AUTH_ROUTE_MODE` 一次只生效一种，**不并存**（默认 `static`）。改开关后需重启。代码里两种都实现了，便于整站切换，不是同一进程双开。钉死一种或为切换预留两份元数据，见 `docs/ROUTING.md`。
- 默认 `static`：不请求菜单接口，侧边栏从本地 `(admin)` 文件树的 `staticData` 生成；没有 `staticData` 的节点丢弃，也不会把子路由提到上一级。
- `dynamic`：登录后拉当前账号菜单，本地文件树没有的 path 整节点（含 children）丢弃。后端菜单只授权本地 route tree，忽略 `element`。后端 `:param` 会先转为 `$param`。`redirect` 不进入授权集合，由文件路由 `beforeLoad` 跳转。字段对应见 `docs/ROUTING.md`。
- 运行时菜单统一为 `NavigationItem`。
- 守卫、按钮权限、菜单选中、面包屑、Tabs、cache 和刷新统一使用最后一个 match 的 `fullPath` 作为 `originPath`，不要用具体 pathname 做授权 identity。
- 菜单选中优先读授权树上的 `activeMenu`，否则读本地 `staticData.menu.activeMenu`。
- 外链：守卫从后往前找 `staticData.href`；先鉴权再打开。非 preload 时 `window.open(..., noopener,noreferrer)`，当前页回首页（当前已是首页则回 `/404`）。打开前仍过滤非 http(s)。

## 认证与菜单

- token 与可选 refresh token 在 `session.store.ts`；user/menu 只在 Query。登录响应不含 refresh token 时禁用续签，401 保持直接清会话。`AuthUser.id` 是换用户判断的稳定 identity，由 session owner 持久化 `lastLoginUserId`。
- root `beforeLoad` 有 token 则 `initializeSession`（single-flight，绑定 session epoch）。登录/换用户递增 epoch，续签只轮换凭据；旧请求迟到不得重新初始化已登出或已换用户的 session。
- user-info Query 显式 `retry: false`。
- `(admin)/layout` `beforeLoad: guardAdminRoute`：无 token → `/login`（`/home` 不带 redirect）；用户空则 `revokeSession`，由 Guard 唯一负责 redirect。static：本地文件树没有这条 `originPath` → 404，有则放行。dynamic：当前账号菜单未包含该 `originPath` 时，本地有路由 → `/403`，本地也没有 → 404。未知 URL 由 root 404。授权 identity 为 `matches.at(-1).fullPath`。
- 网络/5xx 进 errorComponent，不清 token。401 在存在 refresh token 时 single-flight 续签并只重发一次；续签请求自身不得递归续签。未启用或续签失败时走 `registerUnauthorizedHandler`，只清本地会话并跳登录，不再请求 logout API。
- 登录 redirect 只接受站内路径。

## Tabs 与缓存

- tab id = `getTabId(originPath, multi, fullPath)`；独立 `homeTab`。已存在 Tab 原位 `map` 更新，不改变顺序。关闭全部/左/右/其它由 store 作为唯一导航 owner，仅当前 Tab 被删除时导航。
- 列表 `multi: false`；详情 `multi: true`。菜单就绪后按 `originPath` 过滤全部 Tab（包括 fixed）；当前路由失权时 invalidate Router，由 Guard 跳 403。
- static：keepAlive / multi / activeMenu 来自本地 `staticData`，Tab 与当前页 pane 同源。dynamic：这三项来自当前账号菜单的 `handle`（与 `meta` 等价）；Tab 的 keepAlive 以菜单项为准（显式 `false` 不会被本地 `true` 覆盖），停在当前页时 pane 额外看 `route.staticData.keepAlive`。以后若要改开关，把 `staticData` 与 `handle` 对齐。后端不加载 `element`。
- 缓存：`src/layouts/cache`，活动页把 `router.state` 做成只读快照，pane 用 `display:none` 挂着。活动 entry 每次替换为最新 `router.state`。唯一允许碰 `router.__store` / `latestLocation` 的文件是 `src/layouts/cache/snapshot-router.ts`。
- 页面动画：非缓存页 `motion.div initial="initial"`；缓存 pane `initial={false}`，首次创建、切回、刷新都不播放进入动画。`pageAnimate` / `pageAnimateMode` 持久化在 `admin-layout-state`；`prefers-reduced-motion` 只影响渲染解析。
- 刷新只 bump `contentRevision`；关闭 tab 同步丢掉 cache entry。
- 不用 Activity / RouteActivity / keepalive-for-react / AnimatePresence。

## HTTP / Query

- `import api from '@/services/http'`，返回解包后的 `T`。信封 `{ code, msg, data }`，成功码 `200`；鉴权头 `x-access-token`。
- QueryClient：`refetchOnWindowFocus: false`，`retry: 1`；mutation `retry: false`。
- 登出与会话失效调用 `cancelAllRequest()`，中止未自带 `signal` 的在途请求并立刻换新 Controller。取消保持 axios `ERR_CANCELED`，不包装成业务错误、不 toast。
- 401 刷新全局单飞；失败后只清会话并跳登录，过期码不按请求重复提示。
- 列表 `fetchQuery` 必须 `retry: false`。会话终止才 `queryClient.clear()`；user/menu Query 按 session epoch 隔离，换用户 `removeQueries` 保留当前会话数据。
- `api.ts` 只负责 HTTP 输入输出；Query options 负责缓存身份、获取函数与缓存策略，提取条件以 CLAUDE.md §5 为准。

## 状态持久化

这是新模板架构，不提供旧 React Router 模板 localStorage 原地升级。JSON 不存在或损坏时回退当前默认值。

| Store        | key                       | 持久化                                                         |
| ------------ | ------------------------- | -------------------------------------------------------------- |
| theme        | `theme-state` v1          | themeMode/primary/isWeak/isHappy/compactAlgorithm/borderRadius |
| admin-layout | `admin-layout-state` v1   | 菜单/折叠/水印/面包屑/tabs 开关、pageAnimate/pageAnimateMode   |
| session      | `session-state` v1        | token、refreshToken、lastLoginUserId                           |
| tabs         | `tabs-state` v1           | homeTab、tabs；contentRevision 不持久化                        |
| search       | `search-history-state` v1 | 最近 10 条菜单搜索 path                                        |

`isDark` 派生不持久化。`index.html` head 脚本只预刷 `theme-state`。
