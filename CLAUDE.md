# CLAUDE.md

本文件是 **hooks-admin 模板**的 AI 编码规范：技术栈、目录、设计与组件用法。**生成的一切代码必须符合本文件；与本文件冲突的通用习惯一律以本文件为准。**

本规范对「用本模板做任何后台」通用。不要按某个业务系统的信封、权限码或菜单表来写；也不要把本地演示数据、mock 插件写进业务实现。对接真实后端时只改 HTTP 层和 `features/*/api.ts`。

- 工作流与验证：`AGENTS.md`
- 已落地契约：`docs/ARCHITECTURE.md`
- 与后端对齐字段：`docs/BACKEND.md`
- 加页 / `staticData` / 授权：`docs/ROUTING.md`
- 列表：`docs/PROTABLE.md`
- 视觉：`docs/DESIGN.md`

## 0. 取舍

- **极简**：删减/合并/复用优先；新抽象需 ≥2 个真实消费者。单消费者 Query 只有在承担非默认 session / cache / retry 时才单独提取。
- **不引入**：国际化（文案直接中文）、CSS Modules、Footer、灰色模式、Jotai、MSW、Activity / RouteActivity、keepalive-for-react、React Router、为演示而造的页面或 mock 插件。
- **页面动画**：非缓存页用 `motion@12.34.3` 七种 mode；缓存 pane `initial={false}`，首次创建 / 切回 / 刷新都不播放进入动画。不用 AnimatePresence。
- **视觉**：`docs/DESIGN.md`，禁止近似发挥。

## 1. 技术栈

| 类别       | 选型                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| 框架       | React 19 + TypeScript 5.9 + Vite 8                                      |
| UI         | Ant Design 6 + ProTable（`@ant-design/pro-components` 精确锁版）        |
| 样式       | UnoCSS (presetWind4) + Less，无 CSS Modules                             |
| 客户端状态 | Zustand 5（session / 主题 / Admin UI / Tabs / 搜索历史）                |
| 服务端状态 | TanStack Query 5                                                        |
| 路由       | TanStack Router **1.162.8**（与 plugin 精确锁版，禁止 `^`/`~`）         |
| 请求       | axios，只经 `@/services/http`（禁止直接 axios / fetch）                 |
| 工具       | ahooks、dayjs(zh-cn)、clsx                                              |
| 图表       | echarts 6，经 `@/components/ECharts`                                    |
| 图标       | `@iconify/react/offline`（改 `ri-manifest.json` 后 `pnpm icons:build`） |

依赖版本以 `package.json` 和 `pnpm-lock.yaml` 为准。user 只在 Query；token 只在 `session.store.ts`。

包管理器仅 pnpm。Node `>=22.22.0`，pnpm `>=10.26.0`。

```bash
pnpm dev
pnpm type:check
pnpm lint:check
pnpm lint:stylelint    # verify / CI 不跑；pre-commit 会跑
pnpm format:check
pnpm test
pnpm test:e2e
pnpm routes:check
pnpm verify
pnpm icons:build
pnpm commit            # czg + commitlint；仅用户要求时才提交
```

改 `src/pages` 后提交更新后的 `src/router/routeTree.gen.ts`。改图标清单后提交 `ri-local.json`。

## 2. 目录

```text
src/pages/           文件路由与页面 owner
src/layouts/         Admin 壳（一套布局则平铺，不要提前拆 admin/portal）
src/router/          单例、守卫、routeTree.gen.ts（禁止手改）
src/features/        auth / navigation / theme
src/services/        http / query
src/stores/modules/  客户端 Zustand
src/components/      跨页公共 UI
src/hooks/           useIsMobile / useTableOperate / useTreeExpand
src/utils/           date download tree validate color form-rule url
src/app/             AntdBridge + feedback
```

禁止 `src/views/`、`src/routers`、`src/api`、`src/types` 总桶。登录布局在 `src/pages/(auth)/login/layout.tsx`。页面私有文件放同目录 `modules/` 或 `components/`（不是路由）。业务 DTO 放页面 `modules/types.ts`。

## 3. 编码

- 函数组件 + Hooks；class 仅 ErrorBoundary 与 axios 封装。
- Props 用 `interface`。新代码不用 `React.FC` 强制，与所在模块风格一致。
- 禁止匿名默认导出。组件具名函数后 `export default`；工具函数命名导出。
- 禁止裸 `any`（通用封装既有默认参除外）；`import type` 内联式。
- 导入：React / 三方 → `@/` → 相对 → 样式，组间空行。
- 注释不复述代码；只写约束和非显然意图，禁止长篇。文案中文。时间用 dayjs，不用 `new Date()` 做格式化/计算。
- 事件处理 `handleXxx`；回调 prop 以 `on` 开头。

## 4. 样式

1. 一次性布局 / 间距 / 字号 → 页面 Uno utility。
2. ≥3 处相同组合 → `uno.config.ts` shortcut。
3. antd 深层覆盖、伪元素、keyframes → 同目录 `index.less`（禁止 `*.module.less`）。

语义 token，禁裸 hex，禁 `text-[var(--hooks-...)]` 长咒语。暗色 = `html.dark`。新组件必须适配暗色。

页面三类：普通页根节点不锁高度，滚 `.app-main`；标准列表页根节点 `.app-pro-table`，卡片 `.app-pro-table-card`，高度链用 less 建立，禁止页面里写死表体高度；内嵌页根节点 `.app-iframe`，高度链在 `IframePage` 的 less。完整规则见 `docs/DESIGN.md`。

## 5. 组件与工具（先复用）

### ProTable

标准分页 / 搜索 / CRUD 直接用 ProTable，禁止再包一层。树表、双表、报表组合不适合 request/search 时用 antd `Table`。细节见 `docs/PROTABLE.md`。

本模板默认把 ProTable 的 `current/pageSize` 映射为后端 `page/limit`，响应 `{ list, total }`。对接其它字段时**只在页面 request 里映射**，不要改封装、不要抽映射 helper。

```tsx
const requestRows = useCallback<NonNullable<ProTableProps<Row, Search>['request']>>(
  async ({ current: page = 1, pageSize: limit = 10, ...rest }) => {
    const query = { page, limit, ...rest };
    const result = await queryClient.fetchQuery({
      queryKey: ['rows', query],
      queryFn: () => getRows(query),
      retry: false
    });
    return { data: result.list, total: result.total, success: true };
  },
  [queryClient]
);

<ProTable<Row, Search>
  className='app-pro-table'
  cardProps={{ className: 'app-pro-table-card' }}
  request={requestRows}
  onRequestError={() => undefined}
  scroll={{ x: tableWidth, y: '100%' }}
/>;
```

失败抛原异常。keepAlive 列表 Tab 切换不请求、恢复不 `reload`。弹窗 CRUD 用 antd `Modal`/`Form` + `useTableOperate`，不要改成 `ModalForm`。

### 其它

| 能力            | 用法                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Icon            | `<Icon name='ri:home-3-line' />`；页内静态 `import { Icon as SvgIcon } from '@iconify/react/offline'` |
| IconSelect      | 表单选图标，值为 ri 名                                                                                |
| ECharts         | `<ECharts option={option} height={300} />`；暗色 tooltip 用 `getTooltipStyle(isDark)`                 |
| StatCardGrid    | 统计卡片栅格                                                                                          |
| TableExpandIcon | 配 `useTreeExpand`                                                                                    |
| ThemeToggle     | 明暗切换                                                                                              |
| IframePage      | `<IframePage url={url} title={title} />`；文件路由用 `IframeRoutePage` + `staticData.url`             |
| Loading         | 加载态；路由 pending 复用 `pages/loading.tsx`                                                         |
| ErrorBoundary   | AdminContent 已包，页面不必再包                                                                       |

新增图标先写入 `ri-manifest.json` 再 `pnpm icons:build`。禁止裸 `@iconify/react`。

按钮权限：`const { BUTTONS } = useAuthButton()`，`BUTTONS.add && <Button />`。码来自当前路由的 `buttons`（static 读 `staticData`，dynamic 读菜单 `handle`），不要造 `AuthButton` 组件。

提示：`import { message, notification, modal } from '@/app/feedback'`，禁止 antd 静态 `message`。表单校验：`@/utils/validate` + `asFormRule`。通用逻辑先查 ahooks，没有再放 `src/hooks` / `src/utils`。

## 6. HTTP 与 Query

```ts
import api from '@/services/http';

await api.post<Res>({ url: '/path', data });
await api.get<Res>({ url: '/path', params });
```

返回已解包的 `T`。本模板默认信封 `{ code, msg, data }`，成功码 `200`，鉴权头 `x-access-token`。换后端只改 `src/services/http` 与 `src/features/auth/api.ts`、`src/features/navigation/api.ts`，页面不要自己解信封。

QueryClient：`refetchOnWindowFocus: false`，`retry: 1`；mutation `retry: false`。列表 `fetchQuery` 必须 `retry: false`。user / menu 的 `queryKey` 含 session epoch。

`api.ts` 只定义 HTTP 输入输出。满足以下任一才提取 `queries.ts`：同一 options ≥2 个真实调用方；组件与 Guard / loader / prefetch 共用缓存；或必须集中维护非默认 session / retry / staleTime。否则写在调用处。禁止 Query hooks、key factory、CRUD DSL。提取后所有入口共用同一 `queryKey` / `queryFn` / 策略。

## 7. Store

`session` / `theme` / `admin-layout` / `tabs` / `search-history` 在 `src/stores/modules/`。user 与菜单只在 Query。

- 读：`useThemeStore(selectIsDark)`；多字段用 `useShallow`。
- 写：导出的 action（`setToken`、`patchAdminLayout`、`upsertTab`），组件外也可调。
- persist key 见 `docs/ARCHITECTURE.md`。不要从 `@/stores` 聚合导入。

页面局部状态用 `useState`。跨页再进 store 或 Query。

## 8. 路由与权限

页面永远由 `src/pages` 文件路由渲染。后端菜单只授权和展示，不决定加载哪个组件。忽略后端 `element` / `component`；`redirect` 不进授权集合。

`VITE_AUTH_ROUTE_MODE` **一次只生效一种，不并存**（默认 `static`）。改开关后重启。不能按页面混用两种模式。

| 当前模式 | 侧边栏 / 进页                         | 加页还要做的事                                                               |
| -------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| static   | 本地 `staticData`；无文件 → 404       | 文件 + `staticData`；分组自己写带 `title` 的 `layout.tsx`                    |
| dynamic  | 当前账号菜单 ∩ 本地文件；否则 403/404 | 文件 + 菜单数据源里同一条 path；**父级 path 也必须有本地路由**，否则整棵丢掉 |

`staticData` 常用字段：`title`、`keepAlive`、`menu.icon` / `hide` / `order` / `activeMenu`、`tab.multi` / `fixed`、`buttons`、`href`、`url`。完整表见 `docs/ROUTING.md`。

- `originPath` = 最后一个 match 的模板 `fullPath`，不要用 pathname 做授权 / Tab / 缓存 identity。
- 跨模块跳转用 `navigateTo`（`@/router/router-ref`），缓存页里不要 `useNavigate`。
- Tab keepAlive 跟当前模式菜单项（static 即 `staticData`，dynamic 即 `handle`）；人还停在当前页时 pane 仍可读 `staticData.keepAlive`。
- 缓存实现只允许 `src/layouts/cache/snapshot-router.ts` 碰 router 内部字段。关闭 Tab 丢掉对应 entry。

## 9. 认证

`initializeSession`：single-flight，绑定 session epoch，拉 user；dynamic 再拉菜单并按本地 catalog 裁剪。登录 / 换用户递增 epoch；续签只换 token。用 `AuthUser.id` 判断换用户。网络失败保留 token。401：有 refresh token 则单飞续签并只重发一次，否则清会话。HTTP 不静态导入 auth，不请求 logout API。Guard 用 `revokeSession`；主动退出才 `logoutSession` 跳登录。

## 10. 质量

ESLint 10 flat + Prettier + Stylelint。Conventional Commits。仅用户明确要求时才 commit，禁止自动 push。

- 文档：`pnpm exec prettier --check AGENTS.md CLAUDE.md README.md docs/*.md` 与 `git diff --check`。
- 普通代码：`pnpm type:check`、`pnpm lint:check`、`pnpm format:check` 与相关测试。
- 路由 / 认证 / HTTP / Tabs / 缓存或发布前：`pnpm verify`。

## 11. 生成代码时

1. 先查 §5 组件与工具，禁止重复封装 ProTable / 提示 / 图标。
2. 新页面：`src/pages/(admin|auth|errors)/...` + `staticData`；再按当前 `VITE_AUTH_ROUTE_MODE` 补菜单数据源（§8）。
3. 请求只走 `api`；提示只走 `@/app/feedback`；校验走 `validate` + `asFormRule`。
4. 样式先 Uno 语义 token，覆盖走同目录 less。
5. 通用逻辑放 `hooks` / `utils`，不要埋进正在改的页面里。
6. 验证范围跟 §10，不要每一步都跑满 `verify`。
