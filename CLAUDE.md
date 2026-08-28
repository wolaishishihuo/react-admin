# CLAUDE.md

本文件是 **hooks-admin** 的 AI 编码全局指令与项目规范手册。生成的一切代码必须符合本文件；与本文件冲突的通用习惯一律以本文件为准。Agent 执行入口见 `AGENTS.md`，落地契约见 `docs/ARCHITECTURE.md`，路由生成与使用见 `docs/ROUTING.md`，表格见 `docs/PROTABLE.md`，视觉见 `docs/DESIGN.md`。

## 0. 项目定位

**React 技术栈的极简 admin 模板**，纯前端 mock 闭环、开箱即跑。

- **模板极简原则**：删减/合并/复用优先于新增抽象；新抽象原则上需 ≥2 个真实消费者。单消费者 Query 只有在承担非默认 session/cache/retry 契约时才允许单独提取。
- **明确不引入**：国际化（文案直接写中文）、CSS Modules、Footer、灰色模式、Jotai、MSW、Activity/RouteActivity、keepalive-for-react、React Router。
- **页面动画**：非缓存页使用 `motion@12.34.3` 七种 mode；缓存 pane `initial={false}`，首次创建/切回/刷新均不播放进入动画。不使用 AnimatePresence。
- **视觉基准**：`docs/DESIGN.md`。禁止近似发挥。

## 1. 技术栈

| 类别       | 选型                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| 框架       | React 19 + TypeScript 5.9 + Vite 8                                      |
| UI         | Ant Design 6 + ProTable (`@ant-design/pro-components@3.1.14-2`)         |
| 样式       | UnoCSS (presetWind4) + Less，无 CSS Modules                             |
| 客户端状态 | Zustand 5（session/主题/Admin UI/Tabs/搜索历史）                        |
| 服务端状态 | TanStack Query 5                                                        |
| 路由       | TanStack Router **1.162.8**（与 plugin 精确锁版，禁止 `^`/`~`）         |
| 请求       | axios，封装于 `@/services/http`（禁止直接 axios/fetch）                 |
| 工具       | ahooks、dayjs(zh-cn)、clsx                                              |
| 图表       | echarts 6，经 `@/components/ECharts`                                    |
| 页面动画   | `motion@12.34.3`                                                        |
| 图标       | `@iconify/react/offline`（改 `ri-manifest.json` 后 `pnpm icons:build`） |

依赖版本以 `package.json` 和 `pnpm-lock.yaml` 为唯一事实来源；文档只保留架构边界与必须精确锁版的依赖。

登录/用户/菜单走同源 Vite mock（`build/mock.ts`，必须在 proxy 之前，会挡住 `VITE_PROXY`）。失败开关：`localStorage.mockMenuFail=1`、`mockUserInfoFail=1`、`mockSessionExpired=1`。对接真实后端：关掉 mock 插件，改 `VITE_API_URL`，替换 `src/features/auth/api.ts` 与 `src/features/navigation/api.ts`。

user 只在 Query；token 只在 `session.store.ts`。

### 常用命令

```bash
pnpm dev
pnpm preview          # build:dev + vite preview，仍挂 mock
pnpm routes:check
pnpm type:check
pnpm lint:check
pnpm lint:stylelint   # verify / CI 不跑；pre-commit 会跑
pnpm format:check
pnpm test
pnpm test:watch
pnpm test:e2e
pnpm build:dev
pnpm build:test
pnpm build:pro
pnpm verify
pnpm icons:build
pnpm commit           # czg + commitlint
```

环境变量、mock/proxy、verify 与 CI 差异见 `README.md`。路由生成与加页见 `docs/ROUTING.md`。

- 本地 `/api` 由 `build/mock.ts` 拦截，`VITE_PROXY` 不会生效；对接真实后端必须关掉 mock 插件并改 `VITE_API_URL`。
- 改 `src/pages` 后确认 `src/router/routeTree.gen.ts` 已更新并提交；改 `ri-manifest.json` 后跑 `pnpm icons:build` 并提交 `ri-local.json`。
- `pnpm verify` 额外跑 history E2E 和 dynamic 的 cache/auth E2E；CI matrix 只切 hash/history。页面私有文件放 `modules/` 或 `components/`，不要当成路由。

## 2. 目录

```text
src/pages/           文件路由与页面
src/layouts/         Admin 壳（平铺；当前只有一套后台布局）
src/router/          单例、守卫、生成的 routeTree.gen.ts（禁止手改）
src/features/        auth / navigation / theme
src/services/        http / query
src/stores/modules/  客户端 Zustand
src/components/      公共 UI
src/hooks/           useIsMobile / useTableOperate / useTreeExpand
src/utils/           date download tree validate color form-rule url
src/app/             AntdBridge + feedback
```

无 `src/views/`、`src/routers`、`src/api`、`src/types` 总桶。当前只有一套后台布局，所以平铺在 `src/layouts`；将来确实出现第二套大型布局时再拆 `layouts/admin`、`layouts/portal`。登录布局仍在 `src/pages/(auth)/login/layout.tsx`。页面在 `pages`；业务 DTO 放页面 `modules/types.ts`。

## 3. 编码规范

- 函数组件 + Hooks；Props 用 `interface`；禁止匿名默认导出。
- 新代码不用 `React.FC` 强制，与所在模块风格一致。
- 禁止裸 `any`（通用封装既有默认参除外）；`import type` 内联式。
- 导入：React/三方 → `@/` → 相对 → 样式。
- 注释不复述代码；只记录非显然意图、约束和必要原因。文案直接中文。时间用 dayjs。

## 4. 样式

Uno 布局/间距；≥3 处 shortcut；antd 深层覆盖才用 less。语义 token，禁裸 hex。暗色 = `html.dark`。新组件必须适配暗色。标准列表页用 `.app-pro-table` / `.app-pro-table-card`，高度链由列表页 `index.less` 建立。

## 5. 组件与数据

### Query

`api.ts` 只定义 HTTP 输入输出；Query options 绑定 `queryKey`、`queryFn` 和缓存策略。满足以下任一条件才提取 `queries.ts`：同一 options 有 ≥2 个真实调用方；同一缓存同时由组件和 Guard/loader/prefetch 等命令式入口访问；或单消费者必须集中维护非默认 session 隔离、retry、staleTime 策略。其他一次性查询直接写在调用处。禁止为了目录整齐创建 Query hooks、key factory 或 CRUD DSL。

提取后的 options 必须供 `useQuery`、`ensureQueryData`、`fetchQuery` 等入口共享同一缓存契约。`queryKey` 包含影响结果的全部最终参数；user/menu 按 session epoch 隔离。

### ProTable

直接使用 ProTable，禁止二次封装。`/list/useProTable` 是模板中的标准缓存列表示例，明确保留页面 `modules/queries.ts` 以展示 options 契约；普通业务页仍按上一节条件判断。`request` 用 `useCallback` + `queryClient.fetchQuery(userListOptions(query))`，`retry: false`。失败抛原异常，`onRequestError={() => undefined}`。keepAlive 列表 Tab 切换不请求、恢复不 `reload`。详见 `docs/PROTABLE.md`。

### 其他

- ECharts：`<ECharts option={option} height={300} />`，暗色 tooltip 用 `getTooltipStyle(isDark)`；零尺寸不 init，尺寸就绪后只 init 一次；容器 ResizeObserver，unmount dispose。
- Icon：`<Icon name='ri:home-3-line' />`；页内静态图标 `import { Icon as SvgIcon } from '@iconify/react/offline'`。
- 按钮权限：`const { BUTTONS } = useAuthButton()`，`BUTTONS.add && <Button />`。
- 提示：`import { message, notification, modal } from '@/app/feedback'`。
- 表单校验：`@/utils/validate` + `asFormRule`。
- 请求：`import api from '@/services/http'`。

### 文件路由与缓存

添加页面步骤见 `docs/ROUTING.md`。`VITE_AUTH_ROUTE_MODE` 同一时间只生效一种，默认 `static`。在 `src/pages/(admin)/...` 建文件路由并写 `staticData`（`title`、`keepAlive`、`menu.icon` / `menu.hide` / `menu.order` / `menu.activeMenu`、`tab.multi` / `tab.fixed`、`buttons`）。不请求菜单，侧边栏从本地 route tree 生成（没有 `staticData` 的节点不会把子路由提到上一级），Guard 只校验本地文件树；keepAlive / multi / activeMenu / 按钮码都读 `staticData`。

若改为 `dynamic`：还要同步 `src/features/navigation/mock/menu.json` 的 path。登录后拉当前账号菜单，本地没有的 path 整节点丢掉，用这份树做侧边栏和 403；`keepAlive` / `multiTab` / `activeMenu` 读后端 `handle`（`meta` 等价）。Tab 的 keepAlive 以菜单项为准；停在当前页时缓存 pane 仍可用 `staticData.keepAlive`。`element` 忽略。`redirect` 不进入授权集合。

缓存：活动页把 `router.state` 做成只读快照，pane 用 `display:none` 挂着。活动 entry 每次写入最新 `router.state`。Tab 的 keepAlive 来自当前模式菜单项。缓存 pane 无进入动画。内部字段只允许 `src/layouts/cache/snapshot-router.ts` 访问。非 keepAlive 走活 Outlet。守卫、按钮权限、菜单选中、面包屑、Tabs、cache 和刷新统一使用最后一个 match 的 `fullPath` 作为 `originPath`。

### Store

- 读：`useThemeStore(selectIsDark)` 等窄 selector。
- 写：导出的 action（`setToken`、`patchAdminLayout`、`upsertTab`）。
- persist：theme-state / admin-layout-state / session-state / tabs-state / search-history-state。这是新模板，不提供旧 React Router 模板 localStorage 原地升级。

## 6. 认证

`initializeSession` 冷启动与登录后 single-flight，绑定 session epoch：拉 user。若改为 dynamic，再拉当前账号菜单，本地文件树没有的 path 整节点丢掉。登录/换用户递增 epoch，Token 续签只轮换凭据。用服务端 `AuthUser.id` 判断换用户。网络失败保留 token；401 在有 refresh token 时 single-flight 续签并只重发一次，没有或续签失败才清会话。user-info Query `retry: false`。HTTP 不静态导入 auth，也不请求 logout API。Guard 使用不导航的 `revokeSession`，主动退出才由 `logoutSession` 跳登录。

## 7. 质量

ESLint 10 flat + Prettier + Stylelint。提交使用 Conventional Commits；仅在用户明确要求时才执行 commit，禁止自动 push。

- 纯文档改动：`pnpm exec prettier --check AGENTS.md CLAUDE.md README.md docs/*.md` 与 `git diff --check`。
- 普通代码改动：至少运行 `pnpm type:check`、`pnpm lint:check`、`pnpm format:check` 与相关单测。
- 路由、认证、HTTP、Tabs、缓存或发布前验证：运行 `pnpm verify`（比 CI 多跑 history E2E 与 dynamic 的 cache/auth）。
- 交付前检查 `git status --short` 与最终 diff，确认没有无关改动或生成物漂移。
