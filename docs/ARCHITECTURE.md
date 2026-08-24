# 架构契约

本文只描述已经落地的契约，不记录迁移过程。任务明确改变行为时同步更新实现、测试和本文档；其他不一致按 `AGENTS.md` 的裁决流程处理。

## 目录与依赖方向

```text
src/pages            文件路由：URL、布局边界、页面 owner
src/layouts          Admin 壳：当前只有一套后台布局，所以平铺；将来第二套大型布局再拆 layouts/admin、layouts/portal
src/router           单例 router、守卫、routeTree.gen.ts
src/features/auth    登录 API、user Query、session
src/features/navigation  菜单规范化、交集、权限 hook
src/features/theme   ThemeEffects、tokens、切换动画
src/services/http    Axios 客户端、信封解包、401、取消
src/services/query   QueryClient 单例
src/stores/modules   仅客户端状态：session/theme/admin-layout/tabs/search-history
src/components       模板公共 UI
src/hooks            跨页面 React/Ant Design 行为
src/utils            纯函数：date/download/tree/validate/color/form-rule/url
src/app              AntdBridge + feedback
```

禁止：feature 导入 page；HTTP 静态导入完整 auth；Zustand 复制 user/menu。

## 路由

- Vite plugin：`routesDirectory: ./src/pages`，`generatedRouteTree: ./src/router/routeTree.gen.ts`，`routeToken: 'layout'`，`autoCodeSplitting: true`。
- `(admin)` / `(auth)` / `(errors)` 只分组，不进入 URL。
- `VITE_ROUTER_MODE` 选择 hash / history。首页 `/home`，登录 `/login`。
- search 使用 `URLSearchParams` 而非 Router 默认 JSON 序列化，避免 `id=1` 变成 `id=%221%22`。
- 跨模块跳转走 `navigateTo`（`history.push`），避免缓存 pane 内 `useNavigate` 写到静态 snapshot store。
- 后端菜单只授权本地 route tree，忽略 `element`。后端 `:param` 会先转为 TanStack `$param` 再求交集。
- 菜单规范化后统一使用 `NavigationItem`；布局、搜索和面包屑不再消费旧 React Router `RouteObject`。
- 守卫、按钮权限、菜单选中、面包屑、Tabs、cache 和刷新统一使用最后一个 match 的 `fullPath` 作为 `originPath`，不要用具体 pathname 做授权 identity。
- 本地 `staticData.activeMenu` 使用同一 path 规范并校验；忽略后端 `meta.activeMenu`。
- 外链只允许 `http/https`，`window.open` 使用 `noopener,noreferrer`。

## 认证与菜单

- token 与可选 refresh token 在 `session.store.ts`；user/menu 只在 Query。登录响应不含 refresh token 时禁用续签，401 保持直接清会话。`AuthUser.id` 是换用户判断的稳定 identity，由 session owner 持久化 `lastLoginUserId`。
- root `beforeLoad` 有 token 则 `initializeSession`（single-flight，绑定 session epoch）。登录/换用户递增 epoch，续签只轮换凭据；旧请求迟到不得重新初始化已登出或已换用户的 session。
- user-info Query 显式 `retry: false`。
- `(admin)/layout` `beforeLoad: guardAdminRoute`：无 token → `/login`（`/home` 不带 redirect）；用户空则 `revokeSession`，由 Guard 唯一负责 redirect；未授权本地路由 → `/403`；未知 URL 由 root 404。动态路由按 `matches.at(-1).fullPath` 授权。
- 网络/5xx 进 errorComponent，不清 token。401 在存在 refresh token 时 single-flight 续签并只重发一次；续签请求自身不得递归续签。未启用或续签失败时走 `registerUnauthorizedHandler`，只清本地会话并跳登录，不再请求 logout API。
- 登录 redirect 只接受站内路径。

## Tabs 与缓存

- tab id = `getTabId(originPath, multi, fullPath)`；独立 `homeTab`。已存在 Tab 原位 `map` 更新，不改变顺序。关闭全部/左/右/其它由 store 作为唯一导航 owner，仅当前 Tab 被删除时导航。
- 列表 `multi: false`；详情 `multi: true`。菜单 Query 成功后按 `originPath` 过滤全部 Tab（包括 fixed）；当前路由失权时 invalidate Router，由 Guard 跳 403。
- 缓存：`src/layouts/cache`，Skyroc snapshot router + `display:none` pane。活动 entry 每次替换为最新 `router.state`。唯一允许碰 `router.__store` / `latestLocation` 的文件是 `src/layouts/cache/snapshot-router.ts`。
- 页面动画：非缓存页 `motion.div initial="initial"`；缓存 pane `initial={false}`，首次创建、切回、刷新都不播放进入动画。`pageAnimate` / `pageAnimateMode` 持久化在 `admin-layout-state`；`prefers-reduced-motion` 只影响渲染解析。
- 刷新只 bump `contentRevision`；关闭 tab 同步丢掉 cache entry。
- 不用 Activity / RouteActivity / keepalive-for-react / AnimatePresence。

## HTTP / Query

- `import api from '@/services/http'`，返回解包后的 `T`。
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
