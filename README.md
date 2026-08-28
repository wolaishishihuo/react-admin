# hooks-admin

React 技术栈的极简 admin 模板：纯前端 mock 闭环、开箱即跑。

## 技术栈

React 19 · TypeScript 5.9 · Vite 8(Rolldown) · Ant Design 6 · ProTable · UnoCSS · Zustand 5 · TanStack Query 5 · TanStack Router 1.162.8 · motion 12.34.3 · iconify ri 离线图标

具体依赖版本以 `package.json` 和 `pnpm-lock.yaml` 为准。项目只允许 pnpm：`preinstall` 会拦截 npm/yarn，`.npmrc` 开启 `engine-strict`。

## 快速开始

需要 Node.js `>=22.22.0` 与 pnpm `>=10.26.0`。

```bash
pnpm install
pnpm dev        # http://localhost:9527，任意账号密码可登录（本地 mock）
```

`pnpm preview` 是 `build:dev` + `vite preview`，preview 仍挂同源 mock。

## 加一个后台页面

没有 `src/pages` 里的文件就没有页面。

`static` / `dynamic` **不并存**：`.env` 的 `VITE_AUTH_ROUTE_MODE` 一次只生效一种（默认 `static`）。改开关后重启，整站切换。

- **钉死 static：** 建文件、写 `staticData`、提交 `routeTree.gen.ts`。分组要有带 `title` 的 `layout.tsx`。
- **钉死 dynamic：** 还要在 `src/features/navigation/mock/menu.json`（或真实菜单接口）补同一条 path，**分组父级 path 也要有本地路由**，否则子树整棵丢掉。
- **以后可能改开关：** 文件、`staticData`、菜单 `handle` 都写齐。这是维护策略，不是运行时双开。详见 [`docs/ROUTING.md`](docs/ROUTING.md)。

字段、守卫、缓存见 [`docs/ROUTING.md`](docs/ROUTING.md)。改菜单/授权代码从 `src/features/navigation/` 进，每个文件头有一句职责。

## 环境变量

Vite 按 `--mode` 叠加根目录 `.env` 与 `.env.[mode]`：

| 命令              | mode        | 主要叠加文件       |
| ----------------- | ----------- | ------------------ |
| `pnpm dev`        | development | `.env.development` |
| `pnpm build:dev`  | development | 同上               |
| `pnpm build:test` | test        | `.env.test`        |
| `pnpm build:pro`  | production  | `.env.production`  |

| 变量                      | 作用                                                                             |
| ------------------------- | -------------------------------------------------------------------------------- |
| `VITE_GLOB_APP_TITLE`     | 浏览器标题、Logo 文案                                                            |
| `VITE_PORT` / `VITE_OPEN` | 开发端口（默认 9527）、是否自动开浏览器                                          |
| `VITE_PUBLIC_PATH`        | 部署 `base`，子路径部署时改这里                                                  |
| `VITE_API_URL`            | axios `baseURL`。development 用 `/api`；test/production 用完整 URL               |
| `VITE_PROXY`              | 仅 development 的 Vite 代理。本地 mock 开启时拦截 `/api`，**这条代理不会走到**   |
| `VITE_AUTH_ROUTE_MODE`    | `static` 或 `dynamic`，**一次一种**。不请求菜单 / 登录后拉当前账号菜单。改完重启 |
| `VITE_ROUTER_MODE`        | `hash` 或 `history`                                                              |
| `VITE_DROP_CONSOLE`       | 构建时丢掉 `console.*`，不影响 `pnpm dev`                                        |
| `VITE_REPORT`             | 构建产出 `stats.html`                                                            |
| `VITE_BUILD_COMPRESS`     | `gzip` / `brotli` / `none`，仅 test/production                                   |

类型定义在 `src/typings/global.d.ts`。

## 本地 Mock 与真实后端

`pnpm dev` 和 `vite preview` 由 `build/mock.ts` 同源拦截 `/api`（插件必须排在 proxy 之前）。菜单数据在 `src/features/navigation/mock/menu.json`。失败开关：`localStorage.mockMenuFail=1`、`mockUserInfoFail=1`、`mockSessionExpired=1`。

`build:test` / `build:pro` **不含 mock**，请求打到对应 `.env` 的 `VITE_API_URL`（模板默认仍是 Apifox）。

对接真实后端：

1. 关掉或加开关移除 `vite.config.ts` 里的 `createMockPlugin()`，否则本地 `/api` 永远进 mock。
2. 按环境改 `VITE_API_URL`；需要绕 CORS 时再配 `VITE_PROXY`。
3. 替换 `src/features/auth/api.ts` 与 `src/features/navigation/api.ts`。
4. 接口信封为 `{ code, msg, data }`，成功码 `200`；鉴权头 `x-access-token`。

## 验证

```bash
pnpm test                                          # tests/unit，Vitest + jsdom
pnpm test:e2e                                      # 默认 static + hash，端口 9528
VITE_ROUTER_MODE=history pnpm test:e2e
VITE_AUTH_ROUTE_MODE=dynamic pnpm test:e2e
pnpm verify                                        # 本地发布前：含 history E2E 与 dynamic 的 cache/auth
```

E2E 会复用已在目标端口上的 Vite；`CI=1` 或 `PLAYWRIGHT_REUSE_SERVER=false` 则强制新起。本机残留错误 env 的进程会导致测到脏实例。

`pnpm verify` 比 GitHub Actions 多跑：history E2E，以及 `dynamic` 下的 `cache.spec` / `auth.spec`。CI 用 hash/history 矩阵，**不跑 dynamic**。Stylelint 只在 pre-commit 和 `pnpm lint:stylelint`，不在 verify/CI。提交走 Conventional Commits（husky + commitlint，`pnpm commit` 用 czg）。

改 `src/assets/icons/ri-manifest.json` 后必须 `pnpm icons:build` 并提交 `ri-local.json`。

## 说明

- `VITE_AUTH_ROUTE_MODE` 一次只生效一种，不并存。默认 `static`：不请求菜单，侧边栏和 keepAlive 来自 `staticData`。`dynamic`：登录后拉当前账号菜单做侧边栏和 403，`keepAlive` / `multiTab` / `activeMenu` 读后端 `handle`。页面始终由本地文件路由决定，不使用后端 `element`。钉死一种或为改开关预留两份元数据，见 [`docs/ROUTING.md`](docs/ROUTING.md)。
- Agent 执行入口见 `AGENTS.md`；完整项目规范见 `CLAUDE.md`；架构契约见 `docs/ARCHITECTURE.md`；**路由生成与使用见 `docs/ROUTING.md`**；设计系统见 `docs/DESIGN.md`；表格规范见 `docs/PROTABLE.md`。
