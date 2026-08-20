# hooks-admin

React 技术栈的极简 admin 模板：纯前端 mock 闭环、开箱即跑。

## 技术栈

React 19 · TypeScript 5.9 · Vite 8(Rolldown) · Ant Design 6 · ProTable · UnoCSS · Zustand 5 · TanStack Query 5 · TanStack Router 1.162.8 · motion 12.34.3 · iconify ri 离线图标

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:9527，任意账号密码可登录（本地 mock）
```

## 说明

- 登录/菜单均为本地 mock：`build/mock.ts` 同源拦截 `/api`，菜单数据在 `src/features/navigation/mock/menu.json`。对接真实后端替换 `src/features/auth/api.ts` 与 `src/features/navigation/api.ts`。
- 完整项目规范见 `CLAUDE.md`；架构契约见 `docs/ARCHITECTURE.md`；设计系统见 `docs/DESIGN.md`；表格规范见 `docs/PROTABLE.md`。
