# AGENTS.md

本文件为编码智能体在本仓库工作时提供指导。

> `CLAUDE.md` 是指向本文件的符号链接。修改本文件，不要编辑 `CLAUDE.md`。

## 项目事实

- Vite 8 + React 19（**未启用 React Compiler**）+ TS strict + antd 6 / ProComponents + react-router v7 + TanStack Query v5 + Zustand 5 + UnoCSS / Less
- 路由模式由 `VITE_ROUTER_MODE` 决定（hash | history）
- 后端地址、代理、接口前缀全部由 `.env.*` 的 `VITE_API_URL` / `VITE_PROXY` 决定；
  **环境事实（后端、菜单来源、图标体系、权限过滤）一律以 env / 代码现状为准**，本文档只维护公共规则
- JS / TS / JSX **单引号**（Prettier `singleQuote` / `jsxSingleQuote`）；不要开 ESLint `quotes`，否则和 Prettier 打架
- UnoCSS 类名顺序由 ESLint `unocss/order` 管；不要装 `prettier-plugin-tailwindcss`
- 单元 / 组件测试用 **Vitest 4**（`jsdom` + Testing Library）；通用交互 hooks（debounce、fullscreen 等）**优先用 ahooks**，不要自研
- 测试文件放仓库根 `tests/`（按 `src/` 相对路径镜像，如 `src/utils/is` → `tests/utils/is.test.ts`）；从 `vitest` **显式 import** `describe` / `it` / `expect` / `vi`，不要开 `globals`
- 组件测试用 `@testing-library/react`；setup 在 `tests/setup.ts`。不要把 Vitest 配进 `vite.config.ts`（会把 PWA / checker 拖进测试）

命令（pnpm，Node >= 20.19）：

```bash
pnpm dev            # 开发
pnpm type:check     # tsc --noEmit --skipLibCheck，改完代码必须跑
pnpm test           # vitest watch
pnpm test:run       # vitest 单次跑完（CI）
pnpm lint:eslint    # eslint --fix .（含 vite.config 等根配置，不只 src）
pnpm build:pro      # 生产构建
```

## 思考顺序

1. **功能开发**：先分析架构（结构、职责、交互），明确后才动手实现。
2. **代码重构**：先定义理想终态，朝终态增量重构。
3. **调试修复**：先区分「事实 vs 假设」「症状 vs 根因」，厘清前不提修复方案。

信息不完整时请求澄清，不要急于写代码。

## 目标规范 vs 存量现状

本文档描述**目标规范**，存量代码有不符处（`React.FC`、参数位解构、零散 memo）。
规则约束**新代码**；仅当本次任务的主体就是某个旧文件时才顺带迁移该文件，
**禁止**在无关改动中重写整个文件、禁止顺手拆除既有 memo。

## 目录与文件放置

| 问题                              | 是                             | 否                           |
| --------------------------------- | ------------------------------ | ---------------------------- |
| 组件被 ≥2 个页面使用？            | `src/components/`              | `views/<page>/components/`   |
| hook 与某个 API 模块绑定？        | `apis/modules/<m>/hooks.ts`    | `src/hooks/`                 |
| 常量只服务于某个模块 / 页面？     | 就近放模块内                   | `src/constants/`             |
| 状态需要跨页面存活？              | Zustand store                  | 组件 `useState`              |
| 静态配置（图表 option、列定义）？ | 页面 `config/` 文件            | 不要写在组件体内             |
| 给模块 / 组件加单测？             | 仓库根 `tests/`（镜像 `src/`） | 不要和源码同目录 `*.test.ts` |

- 命名：页面目录 camelCase（`accountManage`）；全局组件目录 PascalCase（`AuthButton`）；
  hook 文件 camelCase（`usePermissions.ts`）
- 请求 / 响应类型（`Req` / `Res` 前缀，如 `ReqLogin`、`ResPage<T>`）住 `src/apis/interface/`，不在模块内
- 新增环境变量必须同步 `typings/global.d.ts` 的 `ViteEnv`

### API 模块（固定结构，命名随注释）

```
apis/modules/<module>/
├── urls.ts     # USER_URLS 常量，路径相对 VITE_API_URL
├── api.ts      # fetchXxx：调 http 单例、解包 .data；新接口的 snake_case 在这层转 camelCase
├── keys.ts     # USER_QUERY_KEYS 工厂 —— 仅查询型模块需要
├── hooks.ts    # queryXxxOptions + useXxxQuery / useXxxMutation —— 同上
└── index.ts    # barrel
```

- 命令型模块（如 login）只有 `urls.ts` + `api.ts`，有意为之，不要补齐
- 五件套一律 **named export**（`src/hooks/` 里的 default export 是存量风格，不要带进 API 模块）
- 历史例外：登录 / 续签的 `access_token` 双字段已存在，维持现状但**不要扩散**到新接口

## 新增页面（高频任务，按清单执行）

1. 建 `views/<domain>/<page>/index.tsx`，**必须 default export**（懒加载依赖）；
   页面私有组件放 `components/`，图表 option / 表格列放 `config/`
2. 在**菜单数据源**登记菜单项。数据源以 `fetchGetAuthMenuList`（`apis/modules/login/api.ts`）
   的实现为准：模板期读 `src/assets/json/authMenuList.json`；接真实后端后由接口下发，
   「登记」= 后端菜单配置，前端不改 JSON
3. `element` 是公共约定：形如 `/system/accountManage/index`——前导 `/`、以 `/index` 结尾
   （`ConvertRouter` 拼 `'/src/views' + element + '.tsx'`，格式错了路由找不到）
4. `meta.icon` 与业务图标一律 Remix Icon（Iconify 名 `ri:home-line`）。全项目只走 `<Icon icon="ri:xxx" />`（`@/components/Icon`），大小 / 颜色用 className。不要引 `@ant-design/icons` 或 `@iconify/react`，不要混其他图标集
5. 检查 `usePermissions` 是否有菜单过滤逻辑（模板期只放行部分 `meta.key`，以代码现状为准）：
   过滤存在时新增一级菜单必须同步；菜单改由后端权限控制后应删除这段模板期过滤
6. `meta.isKeepAlive` 控制该页是否被 tabs 缓存（`KeepAlive` 组件）
7. 登录等不走布局的全屏页放 `routers/modules/staticRouter.tsx`，不进菜单数据

## 按钮权限

- 数据只来自 `GET /users/me` 的 `buttons: string[]`，写入 `authStore.authButtons`；不要从菜单 `authList` / 路由 key 再抽一份
- UI 显隐用 `<AuthButton authority='sys:user:create'>`（数组为 AND）；只包入口操作（工具栏按钮、表格操作），不要包 Modal / Drawer / 业务弹窗
- 权限参与 `disabled`、数据过滤、提交守卫时用 `useAuthButton().hasPerm(code)`
- 禁止 `hasRoutePerm`、禁止按当前页菜单 key 取按钮码

## React 组件规范（新代码）

```tsx
// 组件的目标形态
interface UserPanelProps {
  /** 字段注释写意图，不是重复类型 */
  userId: string;
}

const UserPanel = (props: UserPanelProps) => {
  const { userId } = props; // 解构是函数体第一行
  ...
};
```

- 禁止：`function` 声明组件、`React.FC`、参数位解构、内联 props 类型
- 组件内辅助函数用 `function` 声明；可复用的提到组件外
- 影响渲染的状态 → `useState`；不触发渲染的可变值 → `useRef`
- `useEffect` 仅用于外部系统同步 / 命令式集成，创建资源必须 cleanup；
  「mutation 成功后刷新列表」归 `onSuccess` + invalidate，不归 effect

### 组件内部排列顺序

| 顺序 | 内容            | 说明                                        |
| ---- | --------------- | ------------------------------------------- |
| 0    | 常量            | 组件**外部**                                |
| 1    | 环境 hooks      | `useNavigate` / `useLocation` / `useParams` |
| 2    | 全局 store 订阅 | Zustand selector                            |
| 3    | `useState`      |                                             |
| 4    | `useRef`        |                                             |
| 5    | 自定义 hooks    |                                             |
| 6    | 网络 hooks      | `useXxxQuery` / `useXxxMutation`            |
| 7    | 计算变量        | 由以上派生                                  |
| 8    | 函数声明        | 事件处理                                    |
| 9    | `useEffect`     |                                             |
| 10   | `return`        |                                             |

例外：`useState` 初始值依赖上游 hook 返回值时，该 state 跟随其依赖下移。

## Hooks 与性能

优先级：**架构正确 > 状态放对位置 > 按需加载 > memo（最后且需实测证明）**。

`React.memo` / `useCallback` / `useMemo` 新代码默认不用，认可的例外只有三种：

1. **Context value 稳定化**（现成范例：`src/context/Refresh.tsx`）
2. **实测卡顿**：Profiler 确认、架构手段（状态下沉 / 组件组合）解决不了，
   memo 与配套 `useCallback` / `useMemo` **成套使用**并注释测量依据
3. **`useMemo` 派生非平凡值或高开销计算**（范例：`routers/index.tsx` 派生 router）

存量 memo（`AuthButton`、`ECharts` 等）不要求拆除，也不要模仿扩散。

- ESLint 关闭了 `exhaustive-deps`，这不是随意写依赖的许可；有意省略必须注释原因
- Zustand 必须 selector 订阅（`useUserStore(s => s.token)`），禁止整店订阅
- 页面已由 `import.meta.glob` + `lazy` 自动分包，不要手写 `React.lazy`
- 列表 key 用稳定业务 id，可变列表禁止用 index

## 数据层

```
组件 ──→ apis/modules/<m>（hooks.ts 或 api.ts）──→ http 单例
```

组件禁止直接 import axios、禁止直接调 `http.get/post`，URL 一律来自 `MODULE_URLS` 常量。

### HTTP 层已托管（调用侧不要重复做）

拦截器已处理：token 注入、401 续签与并发重放、业务码错误 toast、超时 / 断网提示。

- 调用侧不要对业务错误再 toast，catch 只做流程控制（如复位 loading）
- 全屏 loading 传 `{ loading: true }`；下载用 `http.download`；组件外跳转用 `window.$navigate`
- `message` / `notification` 必须从 `@/hooks/useMessage` 导入，
  **禁止** `import { message } from 'antd'`（静态方法不消费 ConfigProvider 主题）

### 何时用 TanStack Query

先问：这份数据是否需要**生命周期管理**——缓存复用、多处共享、mutation 后失效重取、预取、轮询？
满足任一才用 `useQuery`，否则：

| 场景                           | 正确做法                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| 一次性命令（登录、登出、导出） | 直接 `await fetchXxx`（范例：`LoginForm`）                                           |
| ProTable 的 `request`          | 直接传 `fetchXxx`（配 `utils` 的 `formatDataForProTable`），别套 useQuery 造双份缓存 |
| 启动期权限菜单 / 按钮          | 既定走 `usePermissions` → `authStore`（路由同步依赖），不搬进 Query                  |
| 纯客户端状态                   | `useState` / Zustand                                                                 |

写操作：需要 `isPending` / 失效联动 → `useXxxMutation`（`onSuccess` 里 `invalidateQueries`）；
简单一次性命令直接 `fetchXxx`。

### Query 书写规则

- 全局唯一 client：`import { queryClient } from '@/apis/query'`；
  `createQueryClient` 只用于构造这个单例，**业务代码禁止调用**
- queryKey 一律出自 `MODULE_QUERY_KEYS` 工厂，禁止组件里手写 key 数组
- 先 `queryXxxOptions` 再 `useXxxQuery`（写法范式见 `apis/modules/user/hooks.ts`——预埋范例，
  暂无页面消费；新模块以当下实际在用的 query hooks 为准），
  options 独立导出供 `prefetchQuery` / 路由 loader 复用
- 页面「刷新」按钮走 `src/context/Refresh.tsx`，内部已 `queryClient.invalidateQueries()`

反模式（发现即修正）：query data 拷进 `useState` / Zustand；`useEffect` 监听 data 再 setState；
手写 key 字符串；用 `enabled` 做复杂请求编排（链式依赖封装进模块 `hooks.ts`）。

### Zustand 与 Query 边界

| 状态类型                         | 归属                         |
| -------------------------------- | ---------------------------- |
| 服务端数据（列表、详情、统计）   | TanStack Query               |
| 全局 UI 状态（主题、布局、tabs） | Zustand（`global` / `tabs`） |
| 凭证 token / refreshToken        | Zustand `user`（persist）    |
| 权限菜单 / 按钮（路由同步依赖）  | Zustand `auth`（既定例外）   |
| 单组件临时状态                   | `useState`                   |

新建 store 前先问：是服务端状态吗？是就归 Query。
写法参照既有 store（`stores/modules/user.ts` 或 `global.ts`），类型放 `stores/interface`。

## 样式

- UnoCSS 优先，先查 `uno.config.ts` 已有 shortcuts（`flx-center`、`card`、`sle`、`mt20` 式间距规则）
- `className` 里的 utility 顺序交给 `unocss/order`，不要手排、不要引入 Tailwind 排序插件
- 深嵌套 / 动画写同目录 `index.less`
- 颜色禁止硬编码：用 uno theme 色名（`primary`、`surface` 等）或 `--hooks-*` CSS 变量，否则暗色模式失效
- 非 CSS 场景（echarts）的暗色状态读 `useGlobalStore(s => s.isDark)`

## 核心理念

服务端状态交给 Query 管生命周期，但不是每个请求都值得一份缓存；
可读性 > 过早优化；架构错误不能用 hooks 打补丁——某个 hook 让你觉得「必须要用」时，先质疑设计。
