---
name: new-api-module
description: >-
  Creates or integrates a backend API module under src/apis/modules/<module>/
  with typed Req/Res contracts, field adaptation, optional TanStack Query
  options/mutations, and isolated unit tests. Use when connecting new backend
  endpoints for any page type (CRUD, dashboard, detail, workflow, or upload).
---

# 接入新后端 API 模块

先读 `src/apis/README.md` 确认分层与错误处理约定，再按需创建文件（不建空壳文件）。

## 执行步骤

1. **对齐后端契约**
   - 明确接口前缀（相对 `VITE_API_URL`）、HTTP 方法、请求/响应原始字段（如后端为 snake_case）、分页结构及是否需要特殊配置（`{ loading: true }` / `{ silent: true }` / `{ skipAuthRefresh: true }`）。
   - 在 `src/apis/interface/` 新增 `Req*` / `Res*` 类型（按领域拆独立文件或补入对应文件，禁止 `any`）。

2. **创建核心文件**（`src/apis/modules/<module>/`）
   - `urls.ts`：导出 `MODULE_URLS`，动态路径用函数（如 `DETAIL: (id: string) => \`/orders/${id}\``）。
   - `api.ts`：调用 `@/apis/http` 单例并解包 `.data`；**把后端字段名/格式转换集中在这层**，对外只暴露干净的 camelCase 数据；支持透传 `AxiosRequestConfig`（至少透传 `signal` 供取消请求）。
   - `index.ts`：统一 named export 模块对外能力。

3. **按需补 TanStack Query 层**（仅在真实消费时创建）
   - 仅给 ProTable `request` 或一次性命令（导出/登录）调用的接口，**不要创建 `keys.ts` / `hooks.ts`**。
   - 存在详情、下拉选项、统计看板等普通服务端展示数据时：
     - `keys.ts`：按实际失效粒度建 `MODULE_QUERY_KEYS` 工厂。
     - `hooks.ts`：导出 `queryXxxOptions`（`queryFn` 透传 `({ signal })`）与按需的 `useXxxQuery` / `useXxxMutation`；写操作通用缓存失效放在 `onSuccess` 并与外部回调合并执行。

4. **补针对性单测与验证**
   - 当存在字段转换、复杂边界或 Query 失效联动时，在 `tests/apis/modules/<module>/` 镜像路径补充单测（mock HTTP 请求，显式从 `vitest` import）。
   - 运行 `pnpm type:check`、`pnpm exec oxlint <受影响文件>`、`pnpm exec oxfmt --check <受影响文件>` 及相关 `pnpm test:run`。
