# AGENTS.md

本文件约束本模板及其派生项目中的编码工作。

> `CLAUDE.md` 是指向本文件的符号链接。修改本文件，不要编辑 `CLAUDE.md`。

## 规则的适用方式

- **公共约定保持一致，业务实现按需选择。** 不为凑目录、凑 hooks 或预想中的复用创建空文件、空封装。
- 本文的代码风格约束新代码；修改旧文件时，只迁移与任务相关的部分。除非任务就是重构该文件，否则不要整文件改写、拆除既有 memo 或顺手修复无关问题。
- 子项目的后端契约、业务规则和明确覆盖的公共约定，写入该项目的 `AGENTS.md` 或更近目录的 `AGENTS.md`；未覆盖的规则继续适用。不要根据某个子项目的特例修改模板公共规则。
- **事实与规范分开判断。** 依赖版本、后端地址、数据来源以当前配置和代码为准；存量代码不符合规范，不代表可以继续照搬。发现相关文档失效时同步修正。

## 项目基线与环境

- 模板基线：Vite 8 + React 19 + TS strict + antd 6 / ProComponents + react-router v7 + TanStack Query v5 + Zustand 5 + UnoCSS / Less；实际依赖与命令以 `package.json` 为准。
- 当前模板未启用 React Compiler；子项目是否启用，以构建配置为准，不要仅根据 React 版本推断。
- 路由模式由 `VITE_ROUTER_MODE` 决定（hash | history）；后端地址、代理和接口前缀查 `.env.*` 的 `VITE_API_URL` / `VITE_PROXY` 及 HTTP、代理配置，不在业务代码中另写一套。
- JS / TS / JSX 用**单引号**，由 Prettier 的 `singleQuote` / `jsxSingleQuote` 管理；不要另开 ESLint `quotes` / `jsx-quotes`。
- UnoCSS 类名顺序由 ESLint `unocss/order` 管理；不要装 `prettier-plugin-tailwindcss`。
- 通用交互 hooks（debounce、fullscreen 等）优先复用项目已有 hooks 或 ahooks；已有能力不能满足时再自行实现。

## 工作流程与验证

1. **开发**：先确认组件职责、状态归属、数据流和已有能力，再实现。
2. **重构**：先定义目标行为与边界，增量修改，保持任务范围内的行为可验证。
3. **修复**：先区分事实与假设、症状与根因，取得代码或复现证据后再修复。

先查代码和配置补齐信息；仅当缺失信息会改变业务行为、接口契约或架构选择时请求澄清，常规实现细节沿用约定。

常用命令（pnpm，Node 版本遵守 `package.json` 的 engines）：

```bash
pnpm dev            # 开发
pnpm type:check     # TypeScript 检查
pnpm test           # Vitest watch
pnpm test:run       # Vitest 单次运行
pnpm lint:eslint    # 全仓 ESLint，带 --fix，会修改文件
pnpm build:pro      # 生产构建
```

- 修改 TS / TSX 或相关配置后必须跑 `pnpm type:check`；修改代码须对受影响文件跑 ESLint（`pnpm exec eslint <文件...>`），避免为局部任务自动格式化全仓。
- 业务逻辑、交互或缺陷修复应运行相关测试；新增测试验证可观察行为和关键边界，不为简单样式、文案或文件拆分机械补测试。
- 改动构建、依赖、路由加载或资源集成时运行 `pnpm build:pro`。仅修改文档无需运行代码检查；交付时说明实际检查结果和未完成的检查。
- 测试用独立的 `vitest.config.ts`（jsdom + Testing Library），不要合并 `vite.config.ts`，避免拖入 PWA、checker 等构建插件。
- 测试放根目录 `tests/`，按 `src/` 相对路径镜像（如 `src/utils/is.ts` → `tests/utils/is.test.ts`）；组件测试用 `@testing-library/react`，setup 在 `tests/setup.ts`；从 `vitest` 显式 import 测试 API，不开 `globals`。HTTP 测试 mock 请求，不依赖真实后端。

## 目录与文件放置

- 页面私有组件放 `src/views/<domain>/<page>/components/`；同一领域内复用放 `src/views/<domain>/components/`；跨领域通用组件放 `src/components/`。按实际使用范围放置，不因“以后可能复用”提前抽象。
- API 模块绑定的数据 hooks 放 `src/apis/modules/<module>/hooks.ts`；通用交互 hooks 放 `src/hooks/`。
- 常量就近放模块或页面；跨领域共享才放 `src/constants/`。
- 表格列等较完整的页面配置放页面 `config/`；依赖权限、数据或回调时导出工厂函数并显式传参，不在配置文件里读取隐式页面状态。简单局部常量不必单独建文件。
- 页面目录 camelCase（`accountManage`），通用组件目录 PascalCase（`AuthButton`），hook 文件 camelCase（`usePermissions.ts`）。
- 请求 / 响应类型放 `src/apis/interface/`，新增类型使用 `Req` / `Res` 前缀；可按领域分文件，不必全部堆入 `index.ts`。组件 props 和表单草稿类型留在所属组件或页面。
- 新增环境变量同步 `src/typings/global.d.ts` 的 `ViteEnv`，并检查对应环境配置与解析逻辑。

## API 模块

真实 HTTP 模块统一使用以下职责划分，**文件按实际使用创建**：

```text
src/apis/modules/<module>/
├── urls.ts     # MODULE_URLS：接口地址
├── api.ts      # fetchXxx：请求与协议适配
├── keys.ts     # MODULE_QUERY_KEYS：使用 Query 查询时创建
├── hooks.ts    # Query options 与实际使用的查询 / mutation hooks；按需创建
└── index.ts    # 模块对外导出
```

- `urls.ts` 是本项目的统一组织约定，**不是 TanStack Query 的要求**：集中查找和复用接口地址，不承担缓存职责。普通接口路径相对 `VITE_API_URL`；动态路径可用函数生成，不在页面拼 URL。
- `api.ts` 调 HTTP 单例，普通 JSON 响应解包 `.data`；对外暴露 camelCase 数据。后端字段转换集中在这层，提交参数按接口契约反向适配，不让组件兼容两套字段。
- `keys.ts` 只为实际的 Query 缓存服务；有 GET / 列表接口不等于必须使用 Query。`hooks.ts` 也可只有 mutation，此时不必补没有查询用途的 `keys.ts`。
- 仅直接调用 `fetchXxx`、没有 Query 消费的模块不补 `keys.ts` / `hooks.ts`；同一模块的 ProTable 列表和 Query 详情可各按实际用途组织。纯本地 mock 模块不编造 URL，不创建未消费的 hooks 或预留不存在的接口。
- API 模块统一 **named export**，通过 `index.ts` 提供对外入口；模块内部依赖直接引用对应文件，避免从自己的入口形成循环引用。
- 既有登录 / 续签兼容 `access_token` 与 `accessToken` 的逻辑保持兼容，不扩散到新接口。

## 数据与状态归属

**先判断数据性质，再选请求管理方式；跨页面使用不等于放 Zustand。同一视图中的同一数据源由一套机制管理请求和刷新。**

1. **UI 状态**：单组件用 `useState`；同一页面共享先提升到共同父组件；确需跨页面共享或持续存活的 UI 状态才进 Zustand。需要分享、刷新后恢复的筛选 / 分页状态优先考虑 URL。
2. **启动期权限**：保持 `usePermissions` → `authStore`，供路由同步使用，是服务端数据的既定例外；凭证由 `user` store 管理。
3. **ProTable 列表**：默认由 `request` 调 `fetchXxx`，用 `formatDataForProTable` 适配；通过表单、`params`、`actionRef.reload()` 管理查询和刷新，不再套 Query 缓存同一份列表。
4. **普通组件随页面或参数展示的服务端数据**：默认用 TanStack Query 管加载、错误、参数变化与缓存；不要重复实现 `useEffect + fetch + setState`。事件触发的一次性读取、登录、登出、导出等命令直接 `await fetchXxx` 即可。
5. **写操作**：简单提交可直接 `await fetchXxx`；需要复用 mutation 生命周期或联动 Query 缓存时用 `useXxxMutation`。成功后刷新实际的数据所有者，不为统一写法给简单命令套 Query。

- ProTable 确需共享 Query 缓存时，整体改为 Query 驱动的 `dataSource` / `loading`，显式接管分页、筛选、排序；不要同时让 `request` 和 Query 请求同一列表。
- Query 数据直接消费或派生，禁止为了展示再复制到 `useState` / Zustand；可计算的状态在渲染时计算，不用 effect 同步副本。
- **编辑草稿是合理例外**：打开或切换记录时初始化独立草稿，不修改原始查询数据；后台重取不得覆盖用户未保存的输入，保存成功后刷新原数据。antd Form 的命令式初始化属于允许的集成方式。
- Zustand 必须 selector 订阅（`useUserStore(s => s.token)`），不要整店订阅。新建 store 前先排除服务端缓存、URL 状态和可局部管理的状态；store 类型放 `src/stores/interface/`。

## HTTP 层与错误处理

```text
组件 → src/apis/modules/<module>（hooks.ts 或 api.ts）→ HTTP 单例
```

- 组件禁止直接 import axios、调用 `http.get/post` 或自行发业务请求；业务 URL 来自对应模块的 `MODULE_URLS`。
- HTTP 层已处理 token 注入、401 续签与并发重放、业务码错误、超时及断网提示。调用侧不要重复 toast 同一错误；catch 用于恢复状态或业务流程控制，需向上报告的失败继续抛出，不伪装为成功或空数据。
- 业务校验提示、操作成功提示由调用侧负责。`message` / `notification` / `modal` 从 `@/hooks/useMessage` 导入，不用 antd 的静态调用，避免脱离 ConfigProvider。
- 全屏 loading 传 `{ loading: true }`；下载在 API 模块中走 `http.download`；组件外跳转沿用 `window.$navigate`。
- 调整认证、退出或切换账号流程时，检查 Query 缓存、权限和用户状态的清理，避免复用上一身份的数据。

## TanStack Query 约定

- 应用运行时共享 `@/apis/query` 的 `queryClient`；React hooks 内优先用 `useQueryClient()` 获取当前 Provider 的 client，便于隔离测试，组件外使用导出的单例。`createQueryClient` 仅供基础设施和隔离测试构造实例，业务代码不得另建 client。
- queryKey 出自 `MODULE_QUERY_KEYS` 工厂，包含影响结果的全部业务参数（如 id、分页、筛选，以及存在时的租户范围），不要在组件里手写 key 数组，也不要简单把 URL 当作唯一缓存标识。
- 按实际失效需求设计模块 / 列表 / 详情的 key 层级，查询和失效共用工厂；不为未实现的查询预建 key。
- 查询在模块 `hooks.ts` 导出 `queryXxxOptions`，集中定义 `queryKey`、`queryFn` 与共用策略，供组件和预取复用；`useXxxQuery` 按实际消费封装，组件也可直接 `useQuery(queryXxxOptions(params))`。现有示例在 `src/apis/modules/user/hooks.ts`，不要因此复制其中未使用的接口。
- mutation 的通用缓存失效放模块 hook 的 `onSuccess`，页面关闭弹窗、成功提示及 ProTable reload 放页面回调；封装允许传入回调时须合并执行，不能覆盖模块的失效逻辑。需要等待刷新的流程应返回或 await 失效 Promise。
- 只失效受影响的查询；ProTable 刷新用 `actionRef.reload()`，业务操作不靠整页重挂载刷新。布局的整页“刷新”入口沿用 `src/context/Refresh.tsx`。
- 缓存时间、重取及重试策略默认继承 `src/apis/query/defaults.ts`，仅按明确业务需求覆盖。新增 mutation 必须检查重试策略：当前模板默认会重试，创建、支付、发送等未保证幂等的操作显式设 `retry: false`；只有后端保证可安全重放时才允许自动重试。
- `enabled` 可表达“等待必要参数 / 前置数据就绪”；复杂依赖封装进模块 hooks，不在页面堆编排 effect。无依赖的请求并行，有依赖的按实际顺序请求。

## 新增页面

1. 建 `src/views/<domain>/<page>/index.tsx`，**必须 default export**，供动态路由懒加载；页面已由 `import.meta.glob` + `lazy` 分包，不重复手写页面 `React.lazy`。
2. 查 `src/apis/modules/login/api.ts` 的 `fetchGetAuthMenuList`，确认实际菜单来源。读本地 JSON 时更新对应 JSON；后端下发时通过实际后端配置接入，不修改无效的演示数据，不虚构已完成后端配置。
3. 菜单 `element` 形如 `/system/accountManage/index`：前导 `/`、以 `/index` 结尾；`ConvertRouter` 按 `'/src/views' + element + '.tsx'` 查找页面。
4. 检查 `usePermissions` 是否仍有模板菜单白名单。只有仍用模板数据时才同步演示菜单过滤；菜单已由后端授权时移除模板过滤，不维护第二套前端权限白名单。
5. 按需设置 `meta.isKeepAlive`，确认缓存页的切换、关闭和刷新行为；不要把跨页保存状态一律搬进 store。
6. 登录、错误等固定基础页放 `src/routers/modules/staticRouter.tsx`；业务全屏页可沿用动态菜单的 `meta.isFull`，不要仅因全屏就新增静态路由。

## 按钮权限

- 按钮权限统一来自 `fetchGetCurrentUser()` 返回的 `buttons: string[]`，写入 `authStore.authButtons`；模板对应 `GET /users/me`，当前是否走 mock 以 API 实现为准。子项目改变后端字段或地址，在 API 层适配，保持组件侧契约一致。
- 不从菜单 `authList`、路由 key 或本地角色名再推导一份按钮权限；禁止 `hasRoutePerm` 或按当前页菜单 key 取按钮码。
- UI 显隐用 `<AuthButton authority='sys:user:create'>`（数组为 AND）；只包入口按钮，不包 Modal / Drawer / 业务弹窗。
- 权限参与 `disabled`、数据过滤、提交守卫时用 `useAuthButton().hasPerm(code)`。前端权限只控制交互，真实接口仍须由后端鉴权。

## 组件复用、图标与图表

- 新功能先查 `src/components/`，能覆盖就直接用。`src/views/template/` 是可删除的演示页，业务代码禁止引用，也不要把它当作架构或业务实现依据。
- 菜单和业务图标统一 Remix Icon，只用 `@/components/Icon` 的 `<Icon icon='ri:xxx' />`，大小 / 颜色用 className；业务代码不直接引 `@ant-design/icons` 或 `@iconify/react`，不混图标集。
- 标准图表（柱 / 线 / 环 / 雷达 / 散点）用 `@/components/Echarts/charts`，保持坐标轴、tooltip、图例、空态和色板一致，不在页面 config 再写一套 option。
- 现有组件确实无法表达时才自定义，仍用公共 ECharts 封装与 `useChartTheme` / `theme.ts`，不在页面直接 import echarts、不自建主题色值；有跨页面复用需求的图形补进公共 charts。

## React 组件规范（新代码）

```tsx
// 组件的目标形态
interface UserPanelProps {
  /** 字段注释写意图，不是重复类型 */
  userId: string;
}

const UserPanel = (props: UserPanelProps) => {
  const { userId } = props; // 解构是函数体第一行
  return <div>{userId}</div>;
};
```

- 为保持项目风格，新组件用箭头函数和独立 props 类型，函数体首行解构；不用 `function` 声明组件、`React.FC`、参数位解构或内联 props 类型。这是团队风格约定，不要求迁移无关旧组件。
- 不强制一文件一组件。紧密关联的小型私有组件可同文件；包含独立表单、较复杂交互或需要复用的组件，优先按「目录与文件放置」拆分。组件类型定义在模块顶层，不在其他组件函数内部创建，避免重挂载和状态丢失。
- 组件内事件处理和辅助函数用 `function` 声明；无需访问组件闭包的可复用逻辑提到组件外。
- 影响渲染的状态用 `useState`，不触发渲染的可变值用 `useRef`；由 props / state 能算出的值直接派生。
- hooks 顶层无条件调用；可变列表 key 用稳定业务 id，不用数组 index。
- `useEffect` 用于外部系统同步和命令式集成（DOM、订阅、图表、antd Form 等）；资源必须 cleanup。事件产生的提交、提示和刷新放事件处理或 mutation 回调，不用 effect 监听“成功状态”再执行。

### 组件内部顺序

**依赖关系优先**，通常按以下顺序组织：环境 hooks → store 订阅 → state / ref → 自定义及网络 hooks → 派生值 → 事件函数 → effects → JSX。
查询参数等必须先于消费它的 hook 计算；不要为固定排序拆出多余 state、effect 或 hooks。与实例无关的常量放组件外。

## Hooks 与性能

优先级：**架构正确 > 状态放对位置 > 按需加载 > 有依据的 memo**。新代码默认不加 `React.memo` / `useCallback` / `useMemo`，允许的场景是：

1. Context value 稳定化（范例：`src/context/Refresh.tsx`）。
2. Profiler 或其他测量确认的重复渲染 / 计算瓶颈，先考虑状态下沉、组件组合等结构调整，再针对瓶颈优化并记录依据。
3. 明确高开销的派生计算，或第三方集成需要稳定引用以避免重复创建实例 / 重建订阅；说明具体原因，优先沿用已有封装。

- 按实际依赖选择 memo 工具，**不要求成套使用**；简单计算、普通事件函数和 ProTable `request` 不因“保持引用稳定”统一包 memo。
- memo 不是状态或资源的生命周期保证；必须持续存活的状态放 state / ref，资源按相应生命周期创建和清理。
- effect 等 hooks 的依赖必须反映实际使用值；ESLint 关闭 `exhaustive-deps` 不代表可以任意省略，有意省略必须有可验证的理由和注释。

## 样式

- UnoCSS 优先，先查 `uno.config.ts` 的 shortcuts 与规则（如 `flx-center`、`card`、`sle`、`mt20`）；utility 顺序交给 `unocss/order`，不要手排。
- 深嵌套和动画写同目录 `index.less`，样式作用域限制在所属组件或页面，避免无意覆盖全局 antd。
- 业务界面的颜色用 UnoCSS theme 色名（`primary`、`surface` 等）或 `--hooks-*` CSS 变量，不硬编码明暗主题颜色；需要新增语义色时在主题层统一定义。
- 图表颜色跟随 `useChartTheme`，不要在业务页面另订阅 `isDark` 拼色；修改样式或图表后检查明暗主题下的可读性。
