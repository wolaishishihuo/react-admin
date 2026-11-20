# API、HTTP 与 TanStack Query 规范

编写或调整接口模块、认证退出流程、服务端查询与写操作前阅读本文。

## 1. 模块目录与职责

真实 HTTP 模块放在 `src/apis/modules/<module>/`，**按实际使用创建，不建空文件**：

```text
src/apis/modules/<module>/
├── urls.ts     # MODULE_URLS：接口地址集中定义（本项目的组织约定，非 Query 要求）
├── api.ts      # fetchXxx：调用 HTTP 单例与协议字段适配
├── keys.ts     # MODULE_QUERY_KEYS：仅在使用 TanStack Query 查询时创建
├── hooks.ts    # queryXxxOptions 与实际使用的 Query / Mutation hooks；按需创建
└── index.ts    # 模块对外统一 named export 入口
```

- **路径与适配**：`urls.ts` 路径相对 `VITE_API_URL`，动态路径用函数生成，不在页面拼 URL。`api.ts` 解包普通 JSON 响应的 `.data`，对外统一暴露 camelCase；后端字段映射与提交反向适配集中在该层，不让组件兼容两套字段。
- **按需建文件**：仅直接 `await fetchXxx`（如 ProTable 列表、一次性命令）的模块不补 `keys.ts` / `hooks.ts`；仅有 mutation 的 `hooks.ts` 不必补 `keys.ts`；纯本地 mock 模块不编造不存在的 URL 或未消费的 hooks。
- **导出与依赖**：统一 named export；模块内部文件互相引用时直连对应文件，不从同目录 `index.ts` 回引以避免循环依赖。
- **历史兼容边界**：登录 / 续签兼容 `access_token` 与 `accessToken` 的逻辑只保留在既有认证代码，不扩散到新接口。
- **类型放置**：请求 / 响应类型放 `src/apis/interface/`，新增类型统一 `Req` / `Res` 前缀，可按领域分文件。

## 2. HTTP 层与错误处理

```text
组件 → src/apis/modules/<module>（hooks.ts 或 api.ts）→ HTTP 单例（@/apis/http）
```

- 业务代码禁止直接 import `axios` 或在页面拼业务请求（`oxlint` 已拦截）。
- HTTP 单例已统一处理 token 注入、请求取消、401 续签与并发重放、业务码错误、超时及断网提示：
  - 被取消请求（`axios.isCancel`）静默不提示；
  - 后台静默轮询或登出接口按需传 `{ silent: true }` / `{ skipAuthRefresh: true }`；
  - 全屏遮罩传 `{ loading: true }`；文件下载走 `http.download`；组件外路由跳转用 `window.$navigate`。
- 调用侧**不要重复 toast HTTP 层已提示的错误**；`catch` 仅用于恢复状态或业务控制，需向上传递的失败继续抛出，不伪装成成功或空数组。
- 业务校验提示与操作成功提示由调用侧负责，统一从 `@/hooks/useMessage` 导入 `message` / `notification` / `modal`（禁用 antd 静态调用）。
- **认证 / 退出 / 切号闭环**：统一经 `cancelActiveRequests` / `clearAuthSession`（`@/apis/http`）中止在途请求并清空凭证、用户信息、权限与标签页；Query 缓存在受保护路由随 `token` 清空完成卸载后，由 `src/routers/index.tsx` 的 `RouterProvider` 统一 `clear()`，严禁在受保护页面卸载前清空缓存触发活跃 `useQuery` 重发导致 401。

## 3. TanStack Query 约定

标准模式（与 `ProTable` 共存——列表走 `ProTable.request`，表单选项/详情等走 Query，写操作后精确失效）：

```ts
// keys.ts
export const ORDER_QUERY_KEYS = {
  all: ['order'] as const,
  options: () => [...ORDER_QUERY_KEYS.all, 'options'] as const
};

// hooks.ts
export function queryOrderOptions() {
  return queryOptions({
    queryKey: ORDER_QUERY_KEYS.options(),
    queryFn: ({ signal }) => fetchOrderOptions({ signal })
  });
}

export function useSaveOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReqSaveOrder) => fetchSaveOrder(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.options() })
  });
}
```

（如仓库仍保留模板示例，也可对照 `src/apis/modules/system/{keys.ts,hooks.ts}`。）

- **Client 获取**：应用运行时共享 `@/apis/query` 的 `queryClient`；React hooks 内优先 `useQueryClient()` 以便单测隔离，组件外用单例。`createQueryClient` 仅供基础设施和隔离测试使用，业务代码不得另建 client。
- **QueryKey 工厂**：统一出自 `MODULE_QUERY_KEYS`，包含影响结果的全部业务参数（id、分页、筛选、租户等），不在组件手写 key 数组，也不拿 URL 当唯一缓存 key；按实际失效粒度建层级，不为未实现的查询预建 key。
- **查询定义**：在模块 `hooks.ts` 导出 `queryXxxOptions` 集中定义 `queryKey`、`queryFn` 与策略，供组件和预取复用；`queryFn` 透传 `({ signal })` 给 `api.ts`，确保组件卸载或登出取消能中止底层请求。组件可直接 `useQuery(queryXxxOptions(params))` 或消费封装好的 `useXxxQuery`。
- **Mutation 与缓存失效**：通用缓存失效写在模块 hook 的 `onSuccess`，页面关闭弹窗、提示及 `actionRef.reload()` 写在页面回调；封装允许传入外部回调时须合并执行，不得覆盖模块失效逻辑。需等待刷新的流程应返回或 `await` 失效 Promise。
- **精确刷新**：只失效受影响的查询；ProTable 用 `actionRef.reload()`，不用整页重挂载刷新（布局级整页刷新沿用 `src/context/Refresh.tsx`）。
- **默认策略**：缓存、重取与重试继承 `src/apis/query/defaults.ts`（查询通过 `shouldRetryQuery` 仅重试网络错与 5xx / 408 / 429，跳过取消、业务码错和 4xx；mutation 默认 `retry: false`，仅后端明确保证幂等且确有必要时才按需开启）。
- **依赖编排**：前置条件未就绪用 `enabled` 表达；复杂依赖收进模块 hooks，不在页面堆 effect。无依赖请求并行，有依赖请求按序。
