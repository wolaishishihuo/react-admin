# TanStack Query 接入设计

日期：2026-08-29  
仓库：react-admin  
状态：第一期已落地

## 1. 目标

在本仓库接入 TanStack Query，只管理**服务端数据缓存**。规则对齐 skyroc-admin-preview（三态分离、模块四件套、先 `queryOptions` 再 hook），目录按本仓库现有技术层落地，不引入 Jotai，不新开 `src/service/`。

第一期只立骨架 + `user` 模块样板。登录、权限、动态路由、Zustand 全部保持现有职责。

## 2. 非目标（第一期明确不做）

- 不引入 Jotai；token / 主题 / 标签 / 菜单继续 Zustand
- 不把 `userInfo`、菜单、按钮权限迁进 Query
- 不重写 `RouterProvider` / `RouterGuard` / `usePermissions`
- 不开 `persistQueryClient`
- 不移植 skyroc 的 `useTable`
- 不在 `views/` / `layouts/` / `src/hooks/` 里写 `useQuery` / `useMutation`
- 不把业务 `fetchXxx` 或 `useXxxQuery` 放进 `src/apis/query/`

## 3. 三态边界

| 数据                       | 用什么                       | 本仓库落点                              |
| -------------------------- | ---------------------------- | --------------------------------------- |
| 会过期、可共享的服务端资源 | TanStack Query               | `src/apis/modules/<name>/`              |
| 会话与全局 UI              | Zustand                      | token、主题布局、标签页、`authMenuList` |
| 只影响当前组件             | `useState` / Form / ProTable | 搜索条件、列显隐、弹窗、按钮 loading    |

判断句：这份数据离开这个组件，别的地方还要不要同一份？要 → Query；不要且是交互态 → `useState` / Zustand。

## 4. 目录：`src/apis` 三区

已确认方案 A。Query 是新能力，必须有固定落点，不能塞进 `src/hooks` 或和 axios 单例挤在同一文件。

```
src/apis/
  http/                         # 传输
    index.ts                    # RequestHttp 单例（从现 src/apis/index.ts 挪入）
    config/servicePort.ts
    helper/checkStatus.ts
    helper/axiosCancel.ts
  query/                        # Query 基建，禁止放业务
    defaults.ts
    create-client.ts
    client.ts                   # 应用单例
    index.ts                    # 再导出 defaults / createQueryClient / queryClient
  modules/
    user/                       # 第一期完整四件套（Query 样板）
      urls.ts
      keys.ts
      api.ts
      hooks.ts
      index.ts
    login/                      # 第一期只迁文件 + fetchXxx，不加 Query hook
      urls.ts
      api.ts
      index.ts
  interface/                    # DTO 保持现位置
  index.ts                      # 只再导出 http，不写业务、不桶导出全部 modules
```

删除（迁完后不留半新半旧）：

- `src/apis/modules/user.ts`
- `src/apis/modules/login.ts`
- 根上的 `src/apis/config/`、`src/apis/helper/`（内容并入 `http/`）

兼容入口：

- `import http from "@/apis"` 继续可用（`src/apis/index.ts` default 再导出 `./http`）
- 新代码的传输层写 `import http from "@/apis/http"`
- 业务只从 `@/apis/modules/user`、`@/apis/modules/login` 的 `index.ts` 导入
- `src/apis/index.ts` **禁止** `export * from "./modules/*"`，避免环依赖和乱塞

`src/hooks/` 只放 UI / 编排（`useTheme`、`usePermissions`、`useTableScroll`）。网络 hook 只能出现在对应模块的 `hooks.ts`。

## 5. 模块文件职责与命名

每个后端模块一个文件夹。有缓存订阅才加 `keys.ts` / `hooks.ts`；没有则第一期可以只有 `urls` + `api`（`login` 就是这种）。

| 文件       | 职责                                                               | 禁止                                      |
| ---------- | ------------------------------------------------------------------ | ----------------------------------------- |
| `urls.ts`  | `MODULE_URLS` 常量                                                 | 发请求、读 store                          |
| `keys.ts`  | `MODULE_QUERY_KEYS` / `MODULE_MUTATION_KEYS`，元组 + `as const`    | 写死带参数的 list key                     |
| `api.ts`   | `fetchXxx`：纯 HTTP，unwrap `ResultData.data`，空 token 等前置判断 | 任何 React hook                           |
| `hooks.ts` | `queryXxxOptions` + `useXxxQuery` / `useXxxMutation`               | 内联散落的 queryKey（只能引用 `keys.ts`） |
| `index.ts` | 再导出本模块公开 API                                               | 导出别的模块                              |

命名：

| 类型          | 规则                   | 例子                                        |
| ------------- | ---------------------- | ------------------------------------------- |
| URL           | `MODULE_URLS`          | `USER_URLS.LIST`、`LOGIN_URLS.LOGIN`        |
| Query Key     | `MODULE_QUERY_KEYS`    | `USER_QUERY_KEYS.LIST(params)`              |
| Mutation Key  | `MODULE_MUTATION_KEYS` | `USER_MUTATION_KEYS.CREATE`（第一期可暂无） |
| 请求          | `fetchXxx`             | `fetchGetUserList`、`fetchLogin`            |
| Options       | `queryXxxOptions`      | `queryUserListOptions`                      |
| Query Hook    | `useXxxQuery`          | `useUserListQuery`                          |
| Mutation Hook | `useXxxMutation`       | 第一期不写登录 mutation                     |

Key 按 `[模块, 资源, ...params]` 分层。列表 / 详情必须是工厂：

```ts
export const USER_QUERY_KEYS = {
  LIST: (params: ReqPage) => ["user", "list", params] as const,
  DETAIL: (id: string) => ["user", "detail", id] as const
} as const;
```

`queryXxxOptions` 是唯一写 `queryKey` / `queryFn` / 覆盖 staleTime 的地方。hook 只做 `useQuery(queryXxxOptions(...))`。同一份 options 给组件订阅和以后的 `queryClient.ensureQueryData`。

`fetchXxx` 必须 unwrap。现有 `http.post` 返回 `ResultData<T>`，进 cache 的是 `T`：

```ts
export async function fetchGetUserList(params: ReqPage) {
  const { data } = await http.post<ResPage<UserList>>(USER_URLS.LIST, params);
  return data;
}
```

调用方从 `const { data } = await loginApi()` 改为 `const data = await fetchLogin()`（或继续解构资源字段）。类型保持 camelCase，转换停在 `api.ts`。

旧名 `getUserList` / `loginApi` / `logoutApi` / `getAuthMenuListApi` / `getAuthButtonListApi` 在迁入时改成 `fetchXxx`，并改掉现有 4 处引用。不留长期别名。

写操作成功后只 `invalidateQueries({ queryKey: USER_QUERY_KEYS.LIST(...) })`（或前缀 `["user", "list"]`）。第一期不在 mutation 里手搓列表塞进 cache。

## 6. Query 全局默认

从 skyroc 的 `defaults.ts` 原样采用，放在 `src/apis/query/defaults.ts`。

| 项                     | 值    | 含义                                                       |
| ---------------------- | ----- | ---------------------------------------------------------- |
| `staleTime`            | 30s   | 普通列表默认新鲜                                           |
| `gcTime`               | 10min | 无订阅后内存丢掉，不写 localStorage                        |
| `refetchOnWindowFocus` | false | 后台切回来不狂刷                                           |
| `refetchOnMount`       | true  | 组件挂载时若过期则重拉                                     |
| `throwOnError`         | false | 错误继续走 axios toast，不靠 Error Boundary                |
| query `retry`          | 2     | 登录等 mutation 若以后加 hook，在 hook 里写 `retry: false` |
| mutation `retry`       | 1     | 同上                                                       |

会话级数据（以后的 userInfo / 生产菜单）才覆盖 `staleTime: Infinity` + `gcTime: Infinity`。第一期不要用 Infinity。

`queryClient` 只创建一次，挂在 `App` 最外层（`QueryClientProvider` 包住现有 `ConfigProvider` 树）。`Refresh`、logout 都从 `@/apis/query` 取同一份。

开发环境可挂 `@tanstack/react-query-devtools`，仅 `import.meta.env.DEV` 渲染。

## 7. 和现有层怎么接

### 7.1 axios

拦截器、token 头、401 跳登录、错误 toast **原样保留**，只搬家到 `src/apis/http`。走 Query 的接口不要传 `{ loading: true }`，用表格 / 按钮自己的 pending。错误提示只留拦截器，Query 不再 `message.error`。

### 7.2 退出登录

`AvatarIcon` 在 `logoutApi`（迁后为 `fetchLogout`）成功后、清 token / 菜单之外，加 `queryClient.clear()`。顺序：先请求登出（还带得上 token）→ `clear()` → `setToken("")` → `setAuthMenuList([])` → 跳转登录页。

### 7.3 标签刷新

`RefreshContext.refresh` 在卸页的同时 `queryClient.invalidateQueries()`（不带 key，刷新当前会话里所有服务端缓存）。KeepAlive 继续只负责页面实例。不要开 Query persist。

### 7.4 登录 / 权限 / 路由

保持现状：`LoginForm` 调 `fetchLogin` + Zustand `setToken` + `initPermissions`。`usePermissions` 继续调 `fetchGetAuthMenuList` / `fetchGetAuthButtonList` 写入 `useAuthStore`。第一期 `login/` **没有** `hooks.ts`。

### 7.5 ProTable

第一期没有真实表格页要改。约定写进规范即可：`request` 里调 `fetchXxx` 或 `queryClient.fetchQuery(queryXxxOptions())`，页面不写 `useQuery`。

## 8. 第一期文件清单

新增依赖：`@tanstack/react-query`、`@tanstack/react-query-devtools`。

| 动作 | 路径                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| 新建 | `src/apis/http/index.ts`（现 `apis/index.ts` 主体）                                              |
| 移动 | `config/servicePort.ts` → `http/config/servicePort.ts`                                           |
| 移动 | `helper/*` → `http/helper/*`                                                                     |
| 新建 | `src/apis/query/defaults.ts`                                                                     |
| 新建 | `src/apis/query/create-client.ts`                                                                |
| 新建 | `src/apis/query/client.ts`                                                                       |
| 新建 | `src/apis/query/index.ts`                                                                        |
| 新建 | `src/apis/modules/user/{urls,keys,api,hooks,index}.ts`                                           |
| 新建 | `src/apis/modules/login/{urls,api,index}.ts`                                                     |
| 改写 | `src/apis/index.ts`（只再导出 http）                                                             |
| 改写 | `src/App.tsx`（`QueryClientProvider` + DEV Devtools）                                            |
| 改写 | `src/context/Refresh.tsx`（`invalidateQueries`）                                                 |
| 改写 | `src/layouts/components/Header/components/AvatarIcon.tsx`（`queryClient.clear` + `fetchLogout`） |
| 改写 | `src/views/login/components/LoginForm.tsx`（`fetchLogin`）                                       |
| 改写 | `src/hooks/usePermissions.ts`（`fetchGetAuth*`）                                                 |
| 删除 | `src/apis/modules/user.ts`、`src/apis/modules/login.ts`、旧 `config/`、`helper/`                 |

`user` 模块作为样板必须可编译；第一期**不要求**任何页面调用 `useUserListQuery`。没有消费者时 options / hook 仍然保留，作为后续表格页的唯一入口。

## 9. 验收

- `pnpm type:check` 通过
- 登录、动态路由、标签、主题、KeepAlive 行为与现在一致
- 退出登录后 `queryClient` 为空（不会把上一个账号的列表留给下一个）
- 标签刷新会 `invalidateQueries`
- `src/hooks/`、`src/views/`、`src/layouts/` 中不出现 `useQuery` / `useMutation` / 内联 `queryKey`
- 不存在旧的 `apis/modules/user.ts`、`apis/modules/login.ts`

## 10. 后续（不在第一期）

1. 真实用户列表页通过 `useUserListQuery` 或 ProTable + `queryUserListOptions` 接入
2. 有真实「当前用户」接口后再把顶栏 `userInfo` 从 Zustand 迁到 `useUserInfoQuery`
3. 路由启动链路要重构时，再把菜单做成 `queryMenusOptions` + `ensureQueryData`
