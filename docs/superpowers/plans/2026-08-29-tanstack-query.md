# TanStack Query 第一期 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `src/apis` 三区落地 Query 骨架，并用 `user` 模块四件套作为唯一样板。

**Architecture:** axios 整层迁到 `src/apis/http`；QueryClient 单例放 `src/apis/query`；业务只进 `src/apis/modules/<name>`。views / layouts / `src/hooks` 禁止 `useQuery`。登录权限继续 Zustand。

**Tech Stack:** React 19、Zustand、axios、`@tanstack/react-query` v5

## Global Constraints

- 传输层新代码 `import http from "@/apis/http"`；`import http from "@/apis"` 仅作兼容 default 再导出
- `src/apis/index.ts` 禁止桶导出 modules
- `fetchXxx` unwrap `ResultData.data`；旧 API 名全部改掉，不留别名
- 默认 `staleTime: 30s`、`refetchOnWindowFocus: false`、`throwOnError: false`；第一期不用 Infinity
- logout：先 `fetchLogout` → `queryClient.clear()` → 清 token / 菜单
- 刷新标签：`queryClient.invalidateQueries()`
- 验收：`pnpm type:check`；hooks / views / layouts 无 `useQuery`

---

### Task 1: 依赖 + http 三区搬迁

**Files:**

- Create: `src/apis/http/index.ts`, `src/apis/http/config/servicePort.ts`, `src/apis/http/helper/checkStatus.ts`, `src/apis/http/helper/axiosCancel.ts`
- Modify: `src/apis/index.ts`（只再导出 http）
- Delete: `src/apis/config/servicePort.ts`, `src/apis/helper/checkStatus.ts`, `src/apis/helper/axiosCancel.ts`

- [ ] 安装 `@tanstack/react-query`、`@tanstack/react-query-devtools`
- [ ] 将现有 RequestHttp 与 helper 原样迁入 `http/`，拦截器行为不变
- [ ] `src/apis/index.ts` 改为 `export { default } from "./http"`

### Task 2: Query 基建

**Files:**

- Create: `src/apis/query/defaults.ts`, `src/apis/query/create-client.ts`, `src/apis/query/client.ts`, `src/apis/query/index.ts`

- [ ] defaults 与 skyroc 一致（30s / 10min / 关 window focus）
- [ ] `createQueryClient` 浅合并 queries / mutations
- [ ] `queryClient` 单例；DEV 下 cache onError 打 console

### Task 3: user / login 模块

**Files:**

- Create: `src/apis/modules/user/{urls,keys,api,hooks,index}.ts`
- Create: `src/apis/modules/login/{urls,api,index}.ts`
- Delete: `src/apis/modules/user.ts`, `src/apis/modules/login.ts`

- [ ] `fetchGetUserList` unwrap 后返回 `ResPage<UserList>`
- [ ] `queryUserListOptions` / `useUserListQuery`；key 工厂含 LIST / DETAIL
- [ ] login 仅 urls + fetchXxx：`fetchLogin`、`fetchLogout`、`fetchGetAuthMenuList`、`fetchGetAuthButtonList`
- [ ] 菜单 mock unwrap `authMenuList.data`；按钮走 http 并 unwrap

### Task 4: 接缝

**Files:**

- Modify: `src/App.tsx`, `src/context/Refresh.tsx`, `src/layouts/components/Header/components/AvatarIcon.tsx`, `src/views/login/components/LoginForm.tsx`, `src/hooks/usePermissions.ts`

- [ ] App 最外层 `QueryClientProvider`，DEV 挂 Devtools
- [ ] Refresh 卸页同时 `invalidateQueries()`
- [ ] logout 按 spec 顺序 clear
- [ ] LoginForm / usePermissions 改用 unwrap 后的 `fetchXxx`

### Task 5: 验收

- [ ] `pnpm type:check`
- [ ] grep 确认 hooks / views / layouts 无 `useQuery`；旧 `user.ts` / `login.ts` 已删
