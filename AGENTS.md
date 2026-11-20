# AGENTS.md

本文件约束本模板及其派生项目中的编码工作。

> `CLAUDE.md` 是指向本文件的符号链接。修改本文件，不要编辑 `CLAUDE.md`。

## 专题参考文档（按需先读）

涉及以下领域时，先读对应文档再动手：

- **API 模块 / HTTP 层 / 认证退出 / TanStack Query**：`src/apis/README.md`
- **管理列表与 ProTable 布局滚动**：`docs/pro-table.md`
- **ECharts 图表封装与主题**：`src/components/Echarts/README.md`
- **新增标准 CRUD 管理页 SOP**：`.agents/skills/new-crud-page/SKILL.md`

## 适用原则与项目基线

- **公共约定一致，业务按需实现**：不为凑目录或预想复用创建空文件、空封装；修改旧文件只迁移任务相关部分，不顺手整文件改写。子项目特例写入子项目或更近目录的 `AGENTS.md`，不反向污染模板公共规则。
- **事实与规范分开判断**：版本、地址、数据来源以当前代码和配置为准；存量旧写法不代表可继续照搬。先查代码与配置补齐信息，仅在缺失信息会影响业务行为、接口契约或架构选择时再询问。
- **基线栈**：Vite 8（Rolldown + Lightning CSS）+ React 19（未启用 React Compiler）+ TS strict + antd 6 / ProComponents + react-router v7 + TanStack Query v5 + Zustand 5 + UnoCSS / 原生现代 CSS + Oxc（`oxlint` + `oxfmt`）。
- **工具硬门禁**（由工具自动强制，不靠人工维护）：
  - `.oxfmtrc.json`：单引号、无尾逗号、130 列宽、`import` 排序；
  - `.oxlintrc.json`：禁 `any`、`react/exhaustive-deps: error`、`unocss/order`、禁止业务代码直引 `axios` / `@ant-design/icons` / `@iconify/react` / antd 静态 `message` & `notification`。
- 路由模式由 `VITE_ROUTER_MODE` 控制；代理与接口前缀查 `.env.*` 与 `build/proxy.ts`。通用交互 hooks 优先复用项目已有 hooks 或 `ahooks`。

## 工作流程与验证

1. **开发**：确认职责、状态归属与已有能力再实现。
2. **重构**：先定边界、增量改造；**拆分或移动代码必须同步更新所有调用方与单测，严禁保留兼容重导出或仅为测试暴露的生产 `export`**。
3. **修复**：区分事实与假设、症状与根因，拿代码或复现证据再修。

常用命令（pnpm，Node 版本遵守 `package.json` 的 `engines`）：

```bash
pnpm dev            # 开发
pnpm type:check     # TypeScript 检查
pnpm lint           # Oxlint 静态检查（含 unocss/order）
pnpm lint:fix       # Oxlint 自动修复
pnpm format         # Oxfmt 格式化
pnpm format:check   # Oxfmt 格式校验
pnpm test           # Vitest watch
pnpm test:run       # Vitest 单次运行
pnpm build:pro      # 生产构建
```

- 改 TS / TSX 或相关配置必跑 `pnpm type:check`、`oxlint` 与 `oxfmt --check`；改构建、依赖、路由加载或资源集成必跑 `pnpm build:pro`；仅改文档可跳过代码检查。交付时如实汇报已执行与未执行的检查。
- 测试用独立 `vitest.config.ts`（jsdom + Testing Library，不合并 `vite.config.ts`），放根目录 `tests/` 并按 `src/` 镜像；从 `vitest` 显式 import API（不开 `globals`）；HTTP 测试 mock 请求；只为可观察行为与关键边界补测试。

## 目录与命名规范

- **组件归属**：页面私有 → `src/views/<domain>/<page>/components/`；同领域复用 → `src/views/<domain>/components/`；跨领域通用 → `src/components/`。`src/views/template/` 为可删演示页，业务代码禁止引用。
- **Hooks 与配置**：API 数据 hooks → `src/apis/modules/<module>/hooks.ts`；通用交互 hooks → `src/hooks/`；较完整的列配置等 → 页面 `config/`（依赖权限/回调时导出工厂函数显式传参）；跨领域常量才放 `src/constants/`。
- **命名**：页面目录 camelCase（`accountManage`），通用组件目录 PascalCase（`AuthButton`），hook 文件 camelCase（`usePermissions.ts`），请求/响应类型放 `src/apis/interface/` 并带 `Req` / `Res` 前缀。
- **环境变量**：新增环境变量同步 `src/typings/global.d.ts` 的 `ViteEnv` 及 `build/getEnv.ts`。

## 数据与状态归属

**同一视图的同一数据源由一套机制管理请求和刷新；跨页面使用 ≠ 放 Zustand。**

1. **UI 状态**：单组件用 `useState`，同页共享提升到父组件，仅跨页持续 UI 进 Zustand（瞬态字段如抽屉开关通过 `partialize` 排除持久化）；需分享或刷新恢复的筛选/分页优先放 URL。
2. **启动期权限与凭证**：保持 `usePermissions` → `authStore` / `userStore`（供路由同步使用）。
3. **ProTable 列表**：默认 `request` 调 `fetchXxx` + `formatDataForProTable`，用 `actionRef.reload()` 刷新，**不再套 Query**。
4. **普通服务端展示数据**：默认 TanStack Query（细则见 `src/apis/README.md`），禁用 `useEffect + fetch + setState`；一次性命令（登录/登出/导出）直接 `await fetchXxx`。
5. **写操作**：简单提交直接 `await fetchXxx`；需复用生命周期或联动 Query 失效时用 `useXxxMutation`。

- Query 数据直接消费或派生，禁复制到 `useState` / Zustand；**编辑表单草稿是合理例外**（独立初始化，后台重取不覆盖未保存输入）。
- Zustand 统一用 `create`（不用 `zustand/traditional`），必须 selector 订阅，多字段配 `useShallow`；store 不写路由跳转等 UI 副作用；类型放 `src/stores/interface/`。

## 路由、权限与公共组件

- **新增页面**：建 `src/views/<domain>/<page>/index.tsx`（**必须 `default export`**，已由 `ConvertRouter` 按 `**/index.tsx` 自动懒加载分包，勿手写 `React.lazy`）。菜单 `element` 形如 `/system/accountManage/index`；查 `fetchGetAuthMenuList` 与 `usePermissions` 确认实际菜单来源，已接后端时移除模板白名单过滤。固定基础页放 `src/routers/modules/staticRouter.tsx`，业务全屏页沿用菜单 `meta.isFull`，按需开启 `meta.isKeepAlive`。
- **按钮权限**：唯一来源 `fetchGetCurrentUser().buttons` → `authStore.authButtons`，不从菜单或角色名二次推导。显隐用 `<AuthButton authority='code'>`（只包入口按钮，不包弹窗），逻辑判断用 `useAuthButton().hasPerm(code)`。
- **图标与图表**：业务图标统一 `<Icon icon='ri:xxx' />`（`@/components/Icon`）；标准图表用 `@/components/Echarts/charts`，自定义图表仍走公共容器与 `useChartTheme`（细则见 `src/components/Echarts/README.md`）。

## React 组件与性能（新代码）

```tsx
interface UserPanelProps {
  /** 字段注释写意图，不重复类型 */
  userId: string;
}

const UserPanel = (props: UserPanelProps) => {
  const { userId } = props; // 首行解构
  return <div>{userId}</div>;
};
```

- 箭头函数 + 独立 props `interface` + 首行解构；不用 `function` 声明组件、`React.FC`、参数位解构或内联 props 类型；内部事件/辅助函数用 `function` 声明，无闭包依赖逻辑提到组件外；不在组件函数内定义子组件。
- 可由 props / state 算出的值渲染期直接派生；可变列表 key 用稳定业务 id；`useEffect` 只做外部系统同步（DOM/订阅/图表/Form）且必须 cleanup，事件后的提交/提示/刷新放事件处理或 mutation 回调。
- **内部顺序**（依赖优先）：环境 hooks → store 订阅 → state / ref → 自定义及网络 hooks → 派生值 → 事件函数 → effects → JSX。
- **性能原则**：架构正确 > 状态放对位置 > 按需加载 > 有依据的 memo。默认不加 `React.memo` / `useCallback` / `useMemo`，仅允许：Context value 稳定化、实测确认的瓶颈、明确高开销计算或第三方订阅需要稳定引用（注明原因）。`exhaustive-deps` 有意省略须写明可验证理由。

## 样式

- **UnoCSS 优先**：先查 `uno.config.ts` 的 shortcuts（`flex-center`、`card`、`sle`、`icon-btn`）与语义色（`primary`、`surface`、`canvas`、`g-100`~`g-900`、`border-subtle`），明暗主题自动翻转，不硬编码明暗色值；新增语义色在 `src/styles/theme/global.ts` 与 `uno.config.ts` 同步定义。
- 复杂嵌套、覆盖 antd 与动画写同目录原生 `index.css`（原生 CSS Nesting，禁止 Less 的 `&-suffix`），作用域限定在当前组件/页面；图表配色走 `useChartTheme`，不另订阅 `isDark` 拼色。
