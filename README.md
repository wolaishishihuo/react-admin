# hooks-admin

React 技术栈的极简 admin 模板：纯前端 mock 闭环、开箱即跑。

## 技术栈

React 19 · TypeScript 5.9 · Vite 8(Rolldown) · Ant Design 6 · ProTable · UnoCSS · Zustand 5 · TanStack Query 5 · TanStack Router 1.162.8 · motion 12.34.3 · iconify ri 离线图标

具体依赖版本以 `package.json` 和 `pnpm-lock.yaml` 为准。

## 快速开始

需要 Node.js `>=22.22.0` 与 pnpm `>=10.26.0`，项目仅支持 pnpm。

```bash
pnpm install
pnpm dev        # http://localhost:9527，任意账号密码可登录（本地 mock）
```

## 说明

- 开发与本地 preview 的登录、用户、菜单接口由 `build/mock.ts` 同源拦截 `/api`，菜单数据在 `src/features/navigation/mock/menu.json`。test/production 构建使用对应 `.env` 的 `VITE_API_URL`。对接真实后端时替换 `src/features/auth/api.ts` 与 `src/features/navigation/api.ts`，并按环境配置 API 地址。
- Agent 执行入口见 `AGENTS.md`；完整项目规范见 `CLAUDE.md`；架构契约见 `docs/ARCHITECTURE.md`；设计系统见 `docs/DESIGN.md`；表格规范见 `docs/PROTABLE.md`。
