# hooks-admin

React 技术栈的极简 admin 模板：纯前端 mock 闭环、开箱即跑。

## 技术栈

React 19 · TypeScript 5.9 · Vite 8(Rolldown) · Ant Design 6 · ProTable · UnoCSS · Zustand 5 · React Query 5 · React Router 7 · iconify ri 离线图标

## 快速开始

```bash
pnpm install
pnpm dev        # http://localhost:9527，任意账号密码可登录（本地 mock）
```

## 说明

- 登录/菜单均为本地 mock：菜单在 `src/assets/json/authMenuList.json`，登录返回本地固定 token。对接真实后端只需替换 `src/api/modules/login.ts` 中注释标注的实现。
- 完整项目规范见 `CLAUDE.md`；设计系统见 `docs/DESIGN.md`；表格规范见 `docs/PROTABLE.md`。
