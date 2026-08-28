# CLAUDE.md

本文件是 **hooks-admin** 的 AI 编码全局指令与项目规范手册:技术栈、目录约定、设计系统、组件/工具封装、代码规范。**生成的一切代码必须符合本文件;与本文件冲突的通用习惯一律以本文件为准。**

## 0. 项目定位(判断一切取舍的唯一标准)

**React 技术栈的极简 admin 模板**,纯前端 mock 闭环、开箱即跑,服务对象是以此为起点快速开发业务的使用者。

- **模板极简原则**:删减/合并/复用优先于新增抽象;新抽象需 ≥2 个真实消费者才立项;公开 API 面最小化;不为了改而改。
- **明确不引入、禁止添加**:国际化(文案直接写中文,禁 `useTranslation`/`t()`)、CSS Modules、Footer、灰色模式。
- **视觉基准**:以 `docs/DESIGN.md` 为准(tokens/尺寸/组件视觉与交互规则,自包含);新 UI 沿用项目既有图标/文案与既定规则,禁止近似发挥。

## 1. 技术栈与核心依赖

| 类别       | 选型                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| 框架       | React 19 + TypeScript 5.9 + Vite 8(Rolldown)                                                           |
| UI         | Ant Design 6(`@ant-design/happy-work-theme` 快乐主题可选)                                              |
| 高级表格   | `@ant-design/pro-components@3.1.14-6`(仅用 ProTable,见 §5.1)                                           |
| 样式       | UnoCSS(presetWind4,工具类为主) + Less(antd 深覆盖/伪元素等留守场景),**无 CSS Modules**                 |
| 客户端状态 | Zustand 5(persist 持久化)                                                                              |
| 服务端状态 | @tanstack/react-query 5(ProTable request 走 `fetchQuery`;页面独立数据用 `useQuery`)                    |
| 路由       | React Router 7(库模式,`VITE_ROUTER_MODE` 决定 hash/history)                                            |
| 请求       | axios 二次封装于 `@/utils/http`(**禁止直接用 axios/fetch**)                                            |
| 工具库     | ahooks(优先用现成 hook)、dayjs(zh-cn 已设)、clsx                                                       |
| 图表       | echarts 6(经 `@/components/Echarts` 封装)                                                              |
| 交互       | nprogress、react-countup、react-colorful、自研 KeepAlive(React 19 Activity)                            |
| 图标       | `@iconify/react/offline`(ri 本地子集,清单 `src/assets/icons/ri-manifest.json`,改后 `pnpm icons:build`) |

包管理器**仅允许 pnpm**(preinstall only-allow 强制),Node `^20.19.0 || >=22.12.0`。

**登录/用户信息/菜单为纯前端 mock**:登录返回本地固定 token(带模拟延迟);冷启动由 `getUserInfoApi(token)` 反解身份并刷新 userInfo;菜单读 `src/assets/json/authMenuList.json`。三个 DevTools 失败开关:`localStorage.mockMenuFail=1`(菜单失败)、`mockUserInfoFail=1`(用户信息失败,二者均走 `MenuLoadError` 重试视图)、`mockSessionExpired=1`(会话失效,走 `clearAuth` 回登录页)。对接真实后端只需替换 `src/api/modules/login.ts` 中注释标注的实现。

**userInfo 只有一个写入点**:`@/utils/auth` 的 `initPermissions`(登录后与每次冷启动都会跑),`LoginForm` 只落 token——避免登录响应与用户信息接口给出两份不同快照。

### 常用命令

```bash
pnpm dev                 # 开发服务器(端口 9527,vite-plugin-checker 实时 TS 检查)
pnpm build:dev|test|pro  # tsc 类型检查 + vite 构建(对应环境;"test" 指测试环境,项目无测试运行器)
pnpm type:check          # 仅 tsc --noEmit --skipLibCheck
pnpm icons:build         # ri-manifest.json 变更后重新生成离线图标子集
pnpm lint:eslint         # eslint --fix
pnpm lint:stylelint      # stylelint --fix
pnpm commit              # git add -A && czg 交互式规范提交 && git push
```

## 2. 项目目录结构

```text
.
├── build/                  # Vite 构建辅助:getEnv(wrapperEnv)、plugins、proxy
├── scripts/                # extract-icons.mjs:离线图标子集抽取
├── docs/                   # DESIGN.md 设计规范、PROTABLE.md 表格规范
├── src/
│   ├── api/                # 接口定义:config/servicePort + modules/(按模块拆分)
│   ├── assets/             # 图片、icons/(离线图标子集与清单)、json/(mock 菜单)
│   ├── components/         # 全局通用组件(见 §5;KeepAlive 含 Refresh 再导出)
│   ├── config/             # 全局常量(HOME_URL、LOGIN_URL、ROUTER_WHITE_LIST)、nprogress
│   ├── context/            # RefreshProvider:页面刷新 nonce
│   ├── hooks/              # 全局 Hooks:useXxx.ts,camelCase + default export
│   ├── layouts/            # 单骨架(index.tsx:aside+main)+ Sidebar/HeaderBar/MixedMenu/Menu/Tabs/Main/ThemeDrawer
│   ├── routers/            # index.tsx + helper/(ConvertRouter、RouterGuard) + modules/staticRouter
│   ├── stores/             # Zustand:index.ts + interface/ + modules/(global、user、tabs、auth)
│   ├── styles/             # 全局样式、proTable.less 高度链、主题变量、过渡动画
│   ├── types/              # API 类型桶:common/(BaseResponse、分页) + api/<领域>.ts
│   ├── typings/            # 全局 ambient 声明(global.d.ts、window.d.ts)
│   ├── utils/              # 通用工具(index.ts 为 barrel;单文件平铺,仅 http/ 成目录)
│   ├── views/              # 页面视图(home、list/useProTable、login);页内组件放 views/xxx/components/
│   ├── App.tsx             # ConfigProvider:antd 主题/语言/algorithm
│   └── main.tsx            # 入口:React 根 + QueryClientProvider(Zustand 无需 Provider)
├── uno.config.ts           # UnoCSS:presetWind4、shortcuts、语义 theme.colors
├── eslint.config.mjs       # ESLint 10 flat config
└── .env*                   # 环境变量,全部 VITE_ 前缀;VITE_PROXY 配置开发代理
```

> 无 `src/pages/`、`src/enums/`、`src/store/`——页面在 `views/`,枚举随领域类型放 `types/`,store 在 `stores/`。

## 3. 编码规范(硬性约束)

**组件形态**

- 全部函数组件 + Hooks;class 仅允许 ErrorBoundary(React 限制)与 axios 封装。
- Props 用 `interface` 显式声明;新代码用普通函数签名(不写 `React.FC`),存量 `React.FC` 不强制改造,与所在模块风格保持一致。
- 禁止匿名默认导出;组件为具名函数后 `export default`,工具函数命名导出。
- 组件文件结构:PascalCase 目录 + `index.tsx`(+ 按需 `index.less`、`types.ts`);**禁止创建 `*.module.less`**。

**文件落位**

- 共享组件进 `src/components/`,业务页内部组件进对应 `views/xxx/components/`。
- Hooks:`src/hooks/useXxx.ts`,camelCase 文件名 + default export。
- utils:单文件模块一律平铺 `xxx.ts`,仅真正多文件才成目录(现仅 `http/`)。
- 通用能力放正确层级:不依赖当前模块的实现 → `src/hooks`/`src/utils`,禁止埋进正在改的组件里。

**命名**

- 变量/函数 camelCase;常量 UPPER_SNAKE_CASE;类型/接口 PascalCase;事件处理函数 `handleXxx`(回调 prop 以 `on` 开头);Hook 以 `use` 开头。

**类型**

- 业务代码禁止裸 `any`(用 `unknown` 或具体泛型);通用封装的既有泛型默认参除外。
- 接口响应统一 `BaseResponse<T>` 包裹;基础类型(响应壳、`ReqPage`/`ResPage`)→ `src/types/common/`;业务 DTO → `src/types/api/<领域>.ts`。
- 全局 ambient 声明在 `src/typings/`;模块内领域接口放模块旁(`stores/interface`、组件内 `types.ts`)。
- import type 统一内联式(ESLint `consistent-type-imports` 强制,`--fix` 自动处理)。

**导入顺序**

React/三方库 → `@/` 绝对路径 → 相对路径 → 样式文件,组间空行分隔;与既有文件风格保持一致。

**引号**

- 字符串与 JSX 属性一律单引号（Prettier `singleQuote` + `jsxSingleQuote`）。禁止双引号。

**注释(硬约束)**

- **只写「是什么」,一行说清约束/意图;不写「为什么」**。仅复杂必要的功能才展开详述,禁止长篇解释。

## 4. 样式设计系统

**主题变量**:基于 antd Design Token 体系,`useTheme`(src/hooks)把 token 注入 `--hooks-*` CSS 变量;颜色/圆角/阴影一律引用 token 或语义类,**禁止写死数值、禁裸 hex**(留守 less 的特例需注释)。

**Uno 与 Less 分工三原则**(写样式前先过一遍):

1. 一次性布局/间距/字号 → 页面直接 UnoCSS utility;
2. ≥3 处复用的组合 → `uno.config.ts` shortcut(内部用主题变量);
3. antd 深层覆盖、伪元素、keyframes、结构选择器、三方库注入类名 → 留 less(同目录普通 `index.less` 引入),且 less 里不写 utility 一行能解决的声明。

**UnoCSS**:presetWind4,preflight 关闭(用 antd reset)。常用 shortcuts:`wh-full`/`flex-center`/`flex-between`/`app-card`/`icon-btn`/`chip`/`chip-btn`/`toolbar-icon-btn`/`scrollbar-hide`。theme 提供语义色(`text-icon`、`bg-surface`、`bg-canvas`、`border-line-*` 等,映射 `--hooks-*` 变量),**优先用语义 token,禁止 `text-[var(--hooks-...)]` 长咒语**。

**暗黑模式**:暗色 = html `class="dark"`;`themeMode` 三档 light/dark/auto(auto 跟随系统),实际生效值读 `isDark`;另有色弱模式与水印。`index.html` 内联脚本读 zustand `global-state` 做首屏防闪。**所有新组件必须适配暗色**。

**背景层次**:画布(`--hooks-colorBgContent`)恒比卡面(`colorBgContainer`)深一档;Card 默认带边框,层次靠底色深浅 + 边框而非阴影。完整规则见 `docs/DESIGN.md`。

**响应式**:antd 栅格 + Uno 断点(`lt-md:` 等);移动端断点 800px(`useIsMobile`,侧栏转 fixed overlay)。

**app-main 滚动约定(页面模板二选一)**:

- 滚动归 `.app-main`(唯一滚动容器),`.app-header` sticky 吸顶;移动端退化为 body 整页滚。
- **普通页(默认)**:根节点不锁高度,内容自然流整页滚——表单/详情/卡片流全走这个,零高度管理。
- **标准列表页**:根组件直接用 ProTable 挂 `.app-pro-table`,表格卡经 `cardProps.className` 挂 `.app-pro-table-card`,高度链由 `styles/proTable.less` 建立;页面 JSX 禁止 `cardProps.styles.body`/`bodyStyle`/手工测高。

## 5. 组件使用说明(生成页面必须优先复用,禁止重复实现)

### 5.1 ProTable 标准列表页(核心)

标准分页/搜索/CRUD 列表统一**直接使用** `@ant-design/pro-components` 的 ProTable,禁止二次封装(不造 `AppProTable`/`useProTablePage`/CRUD DSL):

```tsx
const queryClient = useQueryClient();

const requestRows = useCallback<NonNullable<ProTableProps<Row, SearchParams>['request']>>(
  async ({ current: page = 1, pageSize: limit = 10, ...businessQuery }) => {
    const query = { page, limit, ...businessQuery };
    const result = await queryClient.fetchQuery({
      queryKey: ['list-query', query],
      queryFn: () => fetchRows(query),
      retry: false
    });
    return { data: result.list, total: result.total, success: true };
  },
  [queryClient]
);

<ProTable<Row, SearchParams>
  className='app-pro-table'
  cardProps={{ className: 'app-pro-table-card' }}
  columns={columns}
  request={requestRows}
  onRequestError={() => undefined}
  rowKey='id'
  search={{ labelWidth: 'auto' }}
  scroll={{ x: tableWidth, y: '100%' }}
/>;
```

- columns 同时描述展示与搜索:展示列不搜索用 `search: false`,只搜索不展示用 `hideInTable: true`,状态选项用 `valueEnum`。
- request 入口把 ProTable 的 `current/pageSize` 解构映射为后端 `page/limit`;`fetchQuery` 必须 `retry: false`。
- 请求失败抛原异常,由 `onRequestError={() => undefined}` 收口;HTTP 层负责唯一错误提示。
- 刷新用 `actionRef`,表单读取用 `formRef`,不维护第二份分页/搜索状态。
- 树表、双表等不适合 request/search 模型的页面,经评估可直接用 antd Table。
- 完整约定见 `docs/PROTABLE.md`;演示页 `views/list/useProTable`。

### 5.2 其他公共组件

| 组件                                    | 用法                                                                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ECharts**(`@/components/Echarts`)     | `<ECharts option={option} height={300} />`,option 类型 `ECOption`;布局变化自动 resize、卸载自动 dispose;**暗色 tooltip 必须用 `getTooltipStyle(isDark)`** |
| **Icon**(`@/components/Icon`)           | 按名字符串渲染 iconify 图标:`<Icon name='ri:home-3-line' />`(菜单等动态场景)                                                                              |
| **IconSelect**                          | 表单用可视化图标单选器(受控 value/onChange,值为 ri 名字符串)                                                                                              |
| **StatCardGrid**                        | 统计卡片栅格,number 值自动数字滚动动画                                                                                                                    |
| **TreeExpandIcon** + `useTreeExpand`    | 树表展开图标与展开状态管理                                                                                                                                |
| **Error 三件套**(403/404/500)           | + `ComponentError`(视图缺失兜底)+ `MenuLoadError`(菜单请求失败重试)                                                                                       |
| **Loading** / **Lazy** / **SwitchDark** | 加载态 / 懒加载包装 / 明暗切换                                                                                                                            |
| **ErrorBoundary**                       | KeepAlive 已按页包住,无需手动包                                                                                                                           |
| **KeepAlive**                           | Main 已接线;缓存页用 `useParams` + ahooks `useCreation` 钉死首屏身份,不要用 `useSearchParams` 当请求身份                                                  |

页内静态图标直接 `import { Icon as SvgIcon } from '@iconify/react/offline'`(**禁裸 `@iconify/react`**,eslint 强制);图标 100% 离线,新增图标名先入 `ri-manifest.json` 再 `pnpm icons:build`。

### 5.3 按钮级权限

按钮可见性由菜单 `meta.auths` 派生,**项目无 AuthButton 组件,禁止新造**:

```tsx
const { BUTTONS } = useAuthButton();
{
  BUTTONS.add && <Button type='primary'>新增</Button>;
}
```

### 5.4 Hooks 与 utils 工具箱(先查这里,别重复造)

**src/hooks/**:`useMessage`(**组件外/统一提示出口**:`import { message, notification, modal } from '@/hooks/useMessage'`,禁止从 antd 直接 import message 静态方法)、`useAuthButton`、`useTheme`、`useIsMobile`、`useClipboard`、`useTableOperate`、`useTreeExpand`、`useDelayedVisible`(加载指示器防闪烁)。通用 hook 需求先查 **ahooks**,没有再自研。

**会话生命周期不在 hooks 里**:建立(`initPermissions`)与清除(`clearAuth`)同住 `@/utils/auth`,二者都是普通函数,组件外也能调。

**src/utils/**(`@/utils` barrel):`validate.ts`(表单校验断言 + `asFormRule` 胶水:`rules={[asFormRule(validatePhone, '手机号格式不正确')]}`)、`download.ts`(blob/url 文件下载)、`date.ts`(RangePicker 日期范围预设)、`menu.ts`(菜单树助手:扁平化/过滤/面包屑)、`is.ts`(类型守卫)、`common.ts`。直接路径模块:`@/utils/http`、`@/utils/color`、`@/utils/themeAnimation`。

## 6. API 请求规范

`import api from '@/utils/http'`,函数式单 config 入参,返回**解包后**的 `Promise<T>`:

```ts
const data = await api.post<ResLogin>({ url: '/login', data: params });
api.get<ResPage<UserList>>({ url: '/user/list', params, showErrorMessage: false, loading: true });
```

- 拦截器:自动注入 token(读 user store);401 防抖(3s 单次提示并登出);非成功 code 统一 `message.error`;断网跳 `/500`;`HttpError` 结构化错误。
- 每请求开关:`showErrorMessage` / `showSuccessMessage` / `loading`(全屏遮罩)。
- 接口定义在 `src/api/modules/*` 按模块拆分,类型走 `@/types`;**禁止直接 import axios / 使用 fetch**。
- **React Query 约定**:`QueryClientProvider` 在 `main.tsx`(`refetchOnWindowFocus: false`、`retry: 1`)。标准列表页走 ProTable `request` + `fetchQuery`(§5.1);页面独立数据用 `useQuery`;复杂写操作再评估 `useMutation`,简单提交直接 `await api.post`。

## 7. 状态管理约定

4 个 store(`src/stores/modules/`):`global`(主题/布局,**持久化**)、`user`(token+用户信息,**持久化**)、`tabs`(多标签,**持久化**)、`auth`(菜单/按钮权限,**不持久化**,每次加载重拉)。统一从 `@/stores` 导入。

- 响应式读取用 store hook:`useGlobalStore(s => s.isDark)`;多字段配 `useShallow` 防无谓重渲染。
- 写入用各 store 导出的**独立 action 函数**(`setToken`、`addTab` 等),内部走 `getState()`,**组件外也能调用**(如 axios 注入 token)。
- `global` 保留通用 setter 签名 `setGlobalState({ key, value })`。
- persist 结构变更时用 `version` + `migrate` 清理存量键。
- 页面局部状态优先组件内 `useState`/`useReducer`;可复用业务逻辑抽自定义 Hook 进 `src/hooks/`。

## 8. 路由与权限

路由**运行时根据菜单数据生成**(当前来源为 mock JSON),不是静态定义。流程(`src/routers/index.tsx`):

1. 挂载时若 `auth.authMenuList` 为空,`initPermissions(token)`(`@/utils/auth`)先校验会话取 userInfo、再拉菜单入 auth store;请求失败(token 仍在)渲染 `MenuLoadError` 重试视图,会话失效(token 已清)由守卫跳登录。
2. `ConvertRouter.tsx` 扁平化菜单树,用 `import.meta.glob('@/views/**/*.tsx')` 把菜单项 `element` 字符串(如 `/home/index`)映射为懒加载组件;指向不存在视图时渲染 `ComponentError` 兜底不白屏。
3. 最终路由 = 静态路由(登录、403/404/500,`modules/staticRouter.tsx`)+ 动态路由(挂 `<LayoutIndex />` 下;`meta.isFull` 全屏页平级)。
4. `RouterGuard`:设 `document.title`;无 token 重定向 `LOGIN_URL`;已登录访问 /login 被 replace;设置 `window.$navigate` 供非组件代码跳转。

**添加页面 = 建 `src/views/...` + 同步 `src/assets/json/authMenuList.json` 的 `path`/`element`**(element = 视图文件路径,如 `/list/useProTable/index`)。

页面缓存:自研 KeepAlive(`@/components/KeepAlive`),底层 React 19 `Activity`;`RefreshProvider` 在 `App.tsx`,刷新走 `refresh()`,关标签由 tabsList 同步剔除缓存。缓存 key 与标签同源,用 `getTabId`(默认 pathname,`meta.multiTab` 才带 query)。

**缓存页按普通 hooks 写。** 多开详情把身份放 path（`/xxx/detail/:id`）,用 `useParams`;隐藏页里 `useParams` / `useLocation` 仍是地址栏当前 URL,首屏身份用 ahooks `useCreation` 钉死。

```tsx
const { id: routeId } = useParams();
const id = useCreation(() => routeId ?? '', []);
const tabPath = useCreation(() => getTabId(), []);

useQuery({ queryKey: ['user-detail', id], queryFn: () => fetchUserDetail(id), enabled: Boolean(id) });

useEffect(() => {
  if (data) setTabTitle(`详情 - ${data.username}`, tabPath);
}, [data, tabPath]);
```

- 本页 id / 请求 key: `useParams` + `useCreation`
- 改标签标题: `setTabTitle(title, tabPath)`(第二参钉死本页标签)
- `useEffect` / `useQuery` 照常写;ProTable `request` 照常写
- 跳转、返回列表仍用 `useNavigate` / `useLocation`

非 `isKeepAlive` 页不需要 `useCreation`。示例见 `src/views/list/useProTable/detail`。

## 9. 代码质量与提交规范

- **ESLint 10 flat config**(`eslint.config.mjs`):@eslint/js + typescript-eslint + react(jsx-runtime) + react-hooks + UnoCSS 插件 + prettier 兼容;`consistent-type-imports` 内联式强制。
- **Prettier** 统一格式化;**Stylelint**(standard + recess-order 属性排序)。
- **Husky**:pre-commit 跑 lint-staged(eslint --fix + prettier);commit-msg 跑 commitlint。
- **提交规范**:Conventional Commits,用 `pnpm commit`(czg 交互式);禁止不规范 commit message。
- TS 严格模式 + `noUnusedLocals`/`noUnusedParameters`;路径别名 `@` → `src`。

## 10. AI 行为指令(硬约束清单)

1. **先复用后造轮子**:写页面/功能前先查 §5 组件与工具箱;不引入与现有依赖重复的三方库,新增依赖必须说明理由。
2. **新页面**:建 `src/views/...` 并同步 mock 菜单 JSON 的 `path`/`element`;标准列表页一律直接用 ProTable + 项目作用域样式(§5.1),禁止二次封装或手工接表格高度。
3. **请求**只走 `@/utils/http` 的 `api.*`;**提示**只走 `@/hooks/useMessage`;**表单校验**优先 `@/utils` 断言 + `asFormRule`。
4. **样式**:先 UnoCSS(语义 token/shortcut),组件级覆盖走同目录普通 `index.less`;禁 CSS Modules、禁裸 hex、禁内联样式写死数值。
5. **文案直接写中文**(无 i18n,禁 `useTranslation`);时间处理统一 dayjs(禁 `new Date()` 参与格式化/计算);图表用 `@/components/Echarts` 并适配暗色 tooltip。
6. **文件落位与命名**遵守 §3;通用能力进 hooks/utils 正确层级,新建文件前先看目标目录既有风格。
7. **注释简短**:只写「是什么」,不写「为什么」;仅复杂必要的逻辑才展开。
8. **每步自查**:改动后跑 `pnpm type:check` + eslint,并做 dev 运行时冒烟;文件改名/移动后必须重启 dev server 再验。
9. **改动先给用户看清单/diff,确认后才 commit**;提交走 Conventional Commits。
10. **极简原则**(§0):解决问题优先删/合并/复用;新抽象需 ≥2 个真实消费者;grep 零引用不足以断定死代码。
