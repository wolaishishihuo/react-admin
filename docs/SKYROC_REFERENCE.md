# Skyroc 基础架构移植说明

本文只讨论四件事：**登录认证、路由缓存、路由权限、axios 封装**。目标是把 Skyroc 已经踩过坑的规则搬进本项目，不改技术栈。

本文所有关于 Skyroc 的描述都来自本地源码，不是文档转述。核对基准：

| 项目   | 位置                      | 基准                              |
| ------ | ------------------------- | --------------------------------- |
| Skyroc | `~/Desktop/github/skyroc` | commit `67ae76c1`                 |
| 本项目 | 当前仓库                  | React 19.2 / RR 7.18 / axios 1.18 |

引用 Skyroc 代码时写明文件路径，便于复核。实现与本文不一致时以代码为准并同步更新本文。

## 1. 结论

保留现有技术栈（React Router 7 / Zustand / axios / TanStack Query / keepalive-for-react）。Skyroc 用的是 TanStack Router + Jotai + monorepo，**它的连接层一行都用不上，值得搬的是纯逻辑和踩坑规则。**

| 能力                           | 决策                 | 依据                                                        |
| ------------------------------ | -------------------- | ----------------------------------------------------------- |
| 二进制响应解 JSON 信封         | 近乎照抄             | 纯函数，且本项目此处有真 bug（见 2.1）。                    |
| `cancelAllRequest`             | 照抄思路，约 10 行   | 共用一个 AbortController，无平台依赖。                      |
| 错误提示按消息去重             | 照抄思路             | 比本项目的全局布尔防抖准确，且它的注释记录了已修的回归。    |
| Tab 身份函数 `getTabIdByRoute` | 照抄，5 行           | 纯函数，顺带修掉本项目 `validateTabs` 的 bug（见 2.2）。    |
| 登出清理与用户切换判定         | 借鉴规则             | 它的"同一用户保留标签、换人才清"比无条件清空更合理。        |
| 隐藏页活跃状态门               | 照抄思路，优先级最高 | 已有真实项目踩坑：切换详情页时隐藏页乱发请求（见 6.4）。    |
| 冷启动会话校验                 | 记录方案，可选后置   | 认证上最本质的差异，但要先有 `getUserInfo` 接口（见 4.4）。 |
| 守卫执行顺序与 redirect 规则   | 借鉴规则             | 顺序与边界通用，连接层用 RR 重写。                          |
| 单飞续签                       | 规则先记录，暂不实现 | 逻辑通用，但必须有后端 Token 协议。                         |
| 选项式钩子 / 命名接缝          | 不引入               | 一个 axios 实例只有一个消费者，接缝不值当（见 3.8）。       |
| `RequestAdapter`               | 不引入               | 真实接口有 11 个成员（见 3.5），是跨端用的。                |
| `createFlatRequest`            | 不引入               | 同项目不该有两套错误消费风格。                              |
| `contentKey`                   | 不需要               | 缓存库的 `renderCount` 已经实现同一件事（见 6.2）。         |
| Router State 快照缓存          | 不移植               | 深度依赖 TanStack Router 内部（见 6.1）。                   |
| 隐藏页 Location 隔离           | 已知缺口，暂不补     | 缺口暂不可观测，补法需 `UNSAFE_` API（见 6.7）。            |
| `@skyroc/axios` 整包           | 不引入               | 会带进 `axios-retry`、`qs`、`nanoid` 三个新依赖。           |
| monorepo / Jotai / i18n / 加密 | 不引入               | 与模板目标无关。                                            |

一句话：**搬纯函数和规则，连接层自己写，拒绝跨端抽象。**

axios 层的借鉴深度已定档为**逻辑级**：只搬 3.1、3.2、3.3 三个纯逻辑点并删掉重试死代码，**现有拦截器结构不动**，不抽选项式钩子（理由见 3.8）。

### 1.1 做完之后与 Skyroc 还差什么

本文全部落地后，得到的是"**规则一致、机制自有、模型更简**"，不是实现对齐。按能力逐块说明：

| 能力     | 会与 Skyroc 一致                                                                      | 仍然不同                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 登录认证 | 单一清理入口、`queryClient.clear()`、用户切换判定、登出请求先于清本地、冷启动会话校验 | 无 refreshToken 与单飞续签；无 `logout` / `modalLogout` 业务码分岔；用户信息落在持久化 zustand，不是 React Query 管的服务端状态 |
| 路由权限 | 守卫执行顺序、redirect 白名单、首页不带 redirect、三种权限的边界划分                  | 只有 dynamic 一种模式；无 `roles` / `permissions` / 超级角色；判定在渲染期同步完成而不是加载前 `await`；无外链路由处理          |
| 路由缓存 | Tab 与缓存共用同一身份函数、`multiTab` 语义、隐藏页副作用随 active 暂停               | 缓存由 `keepalive-for-react` 实现，没有 router state 快照；隐藏页 Location 不隔离（见 6.7）                                     |
| HTTP     | 二进制响应解信封、取消在途请求、错误按消息去重、默认不重试                            | 无 adapter、无 flat 风格、无选项式钩子、无请求加密、无 `X-Request-Id`                                                           |

要让实现真正对齐，代价是换掉 TanStack Router 和 Jotai——那是迁移，不是借鉴，不在本文范围内。

## 2. 两个潜伏的 bug

这两个是核对代码时发现的既有缺陷，不属于"架构增强"。

**两者当前都不可观测**：`src/utils/download.ts` 在 `src` 内零消费者，全项目没有一处 `responseType: 'blob'`；也没有任何页面带查询参数导航（ProTable 把搜索条件留在组件状态里，不写 URL）。所以它们不是"线上故障"，而是**给模板使用者埋的坑**——第一次加导出按钮、第一次加 `/detail?id=` 详情页就会踩到。修复成本很低，建议先做，但不必当成救火。

### 2.1 blob 下载走 `api` 必然失败

`src/utils/http/index.ts` 的响应拦截器无条件解构业务信封：

```ts
const { code, msg } = response.data;
if (code === ApiStatus.success) return response;
```

`responseType: 'blob'` 时 `response.data` 是 Blob，`code` 为 `undefined`，直接落到 `throw createHttpError('请求失败', undefined)`。`src/utils/download.ts` 里备好的 `downloadFileFromBlob` 永远拿不到 blob。附带问题：`HttpError.code` 声明为 `number`，这里实际会收到 `undefined`。

修法见 3.1。

### 2.2 `validateTabs` 会误删带 query 的标签

标签的 `path` 是 `pathname + search`（`getUrlWithParams()`），而 `src/hooks/usePermissions.ts` 传入的 `validPaths` 是菜单原始 path（不含 search）：

```ts
const keep = !item.closable || validPaths.includes(item.path);
```

于是任何带查询参数的标签都被判成悬空标签，连 KeepAlive 实例一起销毁。auth store 不持久化，所以每次刷新浏览器都会触发一次。

Skyroc 的做法是标签同时存两个字段，校验用的是路由路径而不是标签 id：

```ts
// packages/web/admin-layouts/src/state/tabs/shared.tsx
export function extractTabsByAllRoutes(routeIds: string[], tabs: App.Global.Tab[]) {
  return tabs.filter(tab => routeIds.includes(tab.routePath));
}
```

`App.Global.Tab` 里 `id` 是缓存/标签身份（可能带 query），`routePath` 是菜单路由路径。修法见 6.3。

另外 `retryRequest` / `shouldRetry` / `RETRY_DELAY` / `delay` 是死代码：`MAX_RETRIES = 0` 让重试分支永远进不去。按极简原则直接删。

## 3. axios 封装

### 3.1 二进制响应解 JSON 信封（照抄）

Skyroc 的实现（`packages/@core/axios/src/shared.ts`）：

```ts
export async function transformResponse(response: AxiosResponse) {
  const { responseType } = response.config;

  if (!responseType || responseType === 'json') return;

  const isJson = response.headers['content-type']?.includes('application/json');
  if (!isJson) return;

  if (responseType === 'blob') await transformBlobToJson(response);
  if (responseType === 'arraybuffer') await transformArrayBufferToJson(response);
}
```

`transformBlobToJson` 用 `await data.text()` 再 `JSON.parse`，解不出来就保留原始 data 交给调用方。这一点很重要：转换是尽力而为，失败不能把二进制弄丢。

本项目落地位置 `src/utils/http/transform.ts`（新增单文件），拦截器改为：

```ts
axiosInstance.interceptors.response.use(async response => {
  await transformResponse(response);

  // 非 JSON 响应不参与信封解包
  if ((response.config?.responseType || 'json') !== 'json') return response;

  const { code, msg } = response.data;
  ...
});
```

`request<T>` 里同样要分流，非 json 直接返回 `res.data`，不要走 `body.data`。

### 3.2 取消在途请求（照抄思路）

Skyroc 共用一个 controller，abort 后立刻换新的。它的注释解释了为什么不按 requestId 存 Map：

> 不按 requestId 存一张 Map：那样每个请求都会往 Map 里塞一条，而请求正常结束时没有任何地方删除它——长驻页面下这张表只增不减。

```ts
// packages/@core/axios/src/index.ts
let abortController = new AbortController();

instance.interceptors.request.use(async config => {
  // 调用方自带 signal 就由它自己管生命周期，不纳入 cancelAllRequest
  if (!config.signal) config.signal = abortController.signal;
  ...
});

function cancelAllRequest() {
  abortController.abort();
  // 必须换新的：已 abort 的 signal 挂到后续请求上，会让它们一发出就立刻失败
  abortController = new AbortController();
}
```

本项目照此在 `src/utils/http/index.ts` 内实现并导出 `cancelAllRequest`，由 `clearAuth` 调用（见 4.2）。

### 3.3 错误提示按消息去重（照抄思路）

本项目现在是一个全局布尔 + 3 秒定时器（`isUnauthorizedErrorShown`），只针对 401，且同一时刻只能压住一条。Skyroc 是按消息内容去重的栈（`packages/@core/service/src/request/shared.ts`），并且注释里记了一个已修的回归：

> 只摘掉自己这一条。早先这里还会在 5 秒后把整个栈清空，那会连带抹掉这期间进来的其他消息，让它们绕过去重再弹一次——去重的语义正是被那行破坏的。

另一处值得注意的兜底：`onClose` 是可选的，平台可能不回调，所以除了 `onClose` 还挂了 `MSG_MAX_LIFETIME = 5000` 的定时器，避免某条消息永久占着去重位、此后再也弹不出来。

本项目对应实现（`src/utils/http/error.ts`）：

```ts
const errMsgStack = new Set<string>();
const MSG_MAX_LIFETIME = 5000;

function showErrorOnce(msg: string) {
  if (errMsgStack.has(msg)) return;
  errMsgStack.add(msg);

  const timer = setTimeout(() => errMsgStack.delete(msg), MSG_MAX_LIFETIME);

  message.error({
    content: msg,
    onClose: () => {
      clearTimeout(timer);
      errMsgStack.delete(msg);
    }
  });
}
```

### 3.4 `onRequest` 必须返回 config

Skyroc 拒绝给 `|| config` 兜底，理由值得照搬：

> 静默沿用旧配置会把「忘记 return」变成一个能跑但少了认证头的请求。

本项目的请求拦截器是直接改 `request` 再 return，不存在这个坑，但如果以后把注入 token 抽成钩子，要保持这个约束。

### 3.5 不引入 `RequestAdapter`

真实接口不是四个方法，而是 11 个成员（`packages/@core/service/src/request/types.ts`）：`fetchRefreshToken`、`getCurrentPath`、`getRefreshToken`、`getToken`、`redirectToLogin`、`refreshTokenUrl`、`resetAuth`、`setAuth`、`showErrorMessage`、`showErrorModal`、`t`。

它存在的意义是让同一套请求逻辑跨 antd / RN / Next.js 复用。本项目只有一个 Web 应用，请求层直接调 Zustand、`queryClient` 和 `clearAuth` 即可。只有将来真要独立发包或跨端，才值得抽这层。

同理不引入 `createFlatRequest`（Result 风格）：本项目统一抛异常风格，配合 TanStack Query。

### 3.6 重试

Skyroc 默认 `retries: 0`，并且把 axios-retry 的配置独立成一项而不是混进 axiosConfig，因为 `CreateAxiosDefaults` 没有 `retries` 字段，塞进去只能靠类型断言绕过检查。

本项目结论：删掉现有死代码，保持"HTTP 层不重试"，重试交给页面按幂等性显式决定。ProTable 规范已经要求 `fetchQuery` 设 `retry: false`，继续保持。**不要引入 axios-retry。**

### 3.7 单飞续签（规则先记录，暂不实现）

本项目是纯前端 mock，没有 Refresh Token 契约，不实现。但 Skyroc 的规则里有几条是想当然想不到的，先记下来，等真接后端时照做。

`packages/@core/service/src/request/token-refresh.ts`：

```ts
const REUSE_WINDOW = 1_000;

let inFlight: Promise<boolean> | null = null;

export async function refreshToken(adapter: RequestAdapter): Promise<boolean> {
  inFlight ??= handleRefreshToken(adapter);
  const success = await inFlight;

  reuseTimer ??= setTimeout(() => {
    inFlight = null;
    reuseTimer = null;
  }, REUSE_WINDOW);

  return success;
}
```

关键规则：

1. `inFlight` 放**模块级**，不挂在某个请求实例上。HTTP、WebSocket、SSE 用的是同一次登录的凭据，各刷各的会让后发的那次拿着已轮换掉的 refresh token 去换，换回来一次失败和一次莫名其妙的登出。
2. 刷完之后还有 1 秒**复用窗口**。仅靠 `inFlight = null` 不够：一批请求几乎同时拿到过期码是常态，窗口内直接复用结果。
3. 重发标记必须是**字符串键**，不能用 Symbol。axios 的 `mergeConfig` 用 `Object.keys` 遍历配置，Symbol 键在 `instance.request()` 重新 merge 时会被丢掉，标记等于没打。
4. 识别"拿到过期码的是续签请求自己"要**认 url 而不是只认标记**，因为标记靠人记得加，url 由 adapter 必填、漏了编译不过。续签请求再去续签会 await 自己那次未完成的刷新，把自己和所有等待者永久挂起——不是报错，是转圈不动。
5. 已经因续签重发过一次的请求不再刷。`onBackendFail` 本身没有递归上限，而刷完还是过期码说明问题不在 token 上；此时那个 1 秒复用窗口会让第二次起直接返回缓存结果，连一次网络往返的退避都没有，形成纯热循环重发。
6. 登出码的提示已由 `backEndFail` 弹过，`handleError` 里必须跳过，否则同一次失败弹两条。

### 3.8 不抽选项式钩子

Skyroc axios 层真正的设计思想不是那几个工具函数，而是把业务决策点抽成命名钩子：`isBackendSuccess`、`transform`、`onBackendFail`、`onError`、`onRequest`（`packages/@core/axios/src/type.ts`）。本项目这些判断内联在拦截器里。

**本轮不抽。** 抽接缝的收益是"换后端时改动局部化"，成本是给一个只有单一消费者的实例套一层选项管道——按极简原则（新抽象需 ≥2 个真实消费者）不成立。真正需要改的位置本来就集中在 `src/utils/http/index.ts` 的两个拦截器和 `src/api/modules/login.ts` 的注释标注处，范围已经足够小。

如果将来出现第二个请求实例（比如独立域名的文件服务、或要跨端复用），再回来抽这层。届时照 `type.ts` 的钩子签名即可，不必自己重新设计。

### 4.1 Skyroc 的登出做了什么

`apps/admin/src/features/auth/use-auth.ts`：

```ts
async function logout() {
  if (userInfo) localStg.set('lastLoginUserId', userInfo.userId);

  queryClient.clear();
  setState(prev => ({ ...prev, token: '' }));

  clearAuthStorage(); // token + refreshToken
  clearMenus();
  cacheTabs(); // 注意：是缓存标签，不是清空
}
```

它声明成 `async` 是为了给"先请求后端作废令牌、再清本地"留位置——顺序不能反，清本地是同步的，先清了请求就带不上 Authorization。

**它故意不清标签，而是缓存起来**，等下次登录时判断是否换了人：

```ts
// apps/admin/src/features/auth/use-login.ts
const lastLoginUserId = localStg.get('lastLoginUserId');

if (!lastLoginUserId || lastLoginUserId !== info.userId) {
  needRedirect = false;
  localStg.remove('globalTabs');
  localStg.remove('lastLoginUserId');
}
```

同一个人重新登录，标签和 redirect 都保留；换了人才清标签并强制回首页。这比无条件清空更合理。

### 4.2 本项目的现状与改法

本项目有两条登出路径，都只清 `token` + `authMenuList`：

- `src/layouts/components/HeaderBar/components/AvatarIcon.tsx` 的 `logout`
- `src/utils/http/index.ts` 的 `logOut()`（`setTimeout` 500ms 后执行）

从未被清理的：`userInfo`、`searchHistory`（都持久化在 `user-state`）、TanStack Query 缓存（`queryClient` 是 `main.tsx` 里的局部常量，外部拿不到）。标签是靠 `LoginForm` 里的 `setTabsList([])` 在**下次登录时**无条件清掉的，因此同一个人重新登录也会丢标签。KeepAlive 实例随 `LayoutMain` 卸载自然销毁，不需要显式遍历。

改法，两个新文件加一个统一入口：

1. `src/utils/queryClient.ts`：把 `main.tsx` 里的 `queryClient` 挪出来导出单例，`main.tsx` 改为 import。
2. `src/utils/auth.ts`：唯一的 `clearAuth`，按直接路径 `@/utils/auth` 引用，不进 `utils` barrel（避免与 stores 形成循环）。

```ts
export async function clearAuth() {
  cancelAllRequest();

  // 后端作废会话要带 token，必须在清本地之前
  try {
    await logoutApi();
  } catch {
    // 服务端失败静默，客户端登出始终生效
  }

  queryClient.clear();
  setToken('');
  setUserInfo({ name: '' });
  setAuthMenuList([]);
  // 标签留着，由登录时的用户切换判定决定去留
}
```

`AvatarIcon.logout`、http 层 401、以及 `usePermissions` 里"无任何菜单权限"三处全部改调 `clearAuth`。

1. `LoginForm` 用登录身份替换无条件清空。mock 的 `ResLogin` 只有 `userInfo.name`，模板阶段就用它当身份；接真实后端时换成 `userId`：

```ts
const lastLoginUser = localStorage.getItem('lastLoginUser');
if (lastLoginUser !== data.userInfo.name) {
  setTabsList([]);
  localStorage.setItem('lastLoginUser', data.userInfo.name);
}
```

`initAuth` 不新建：`usePermissions().initPermissions` 已经是这个角色（拉菜单、派生权限、校验标签），只需要把它内部的 `setToken('')` 换成 `clearAuth`。

### 4.3 Token 存储不是安全边界

本项目和 Skyroc 都把 token 放本地存储。它适合通用模板，但要明确：页面一旦 XSS，本地 token 可被读取。更高要求下需要后端提供 `HttpOnly + Secure + SameSite` Cookie 并同时设计 CSRF 防护，前端模板不能单方面决定。

### 4.4 冷启动会话校验（方案记录，可选后置）

这是本项目与 Skyroc 在认证上最本质的差异，前面几节的清理规则都覆盖不到它。但它依赖一个当前不存在的接口，**模板阶段不急做，本节只把方案记清楚**。

Skyroc 的 `initAuth()` 第一步是向后端要用户信息：

```ts
// apps/admin/src/features/auth/use-auth.ts
async function initAuth() {
  try {
    const { data } = await refetch(); // useUserInfoQuery
    if (!data) return null;

    await initMenus(data);
    setState(prev => ({ ...prev, initialized: true }));
    return data;
  } catch {
    return null;
  }
}
```

返回 `null` 时守卫会 `await context.logout()` 再跳登录。也就是说**每次冷启动都是一次真实的会话校验**："这个 token 还有效吗、我是谁"由后端回答。

本项目的 `initPermissions(token)` 只拉菜单，`userInfo` 是登录时写进持久化 zustand 的，刷新浏览器不再向后端确认。后果：token 已经失效时前端仍然渲染完整后台，要等下一次业务请求撞 401 才发现。

这不是移植难度问题，而是缺接口——mock 里没有 `getUserInfo`。补法很小：

1. `src/api/modules/login.ts` 增加 `getUserInfoApi`（同现有 mock 风格：延迟 + 可开关失败），接真实后端时替换实现。
2. `initPermissions` 改成先取 userInfo、写入 user store，再拉菜单；userInfo 取不到走 `clearAuth`。

**必须保持两类失败的区分**：菜单/用户接口的网络失败要继续走 `MenuLoadError` 重试视图，只有明确的会话失效（401 或后端说 token 无效）才 `clearAuth`。现在那个重试视图存在的意义正是防止把网络抖动误判成登出，加了 userInfo 校验后不能把两者合并成一条路径。

仍然不做的：refreshToken 单飞续签（见 3.7），以及 Skyroc 的 `logout` / `modalLogout` 业务码分岔（弹窗确认后登出、`beforeunload` 兜底）——后者要等后端定义业务码体系。

## 5. 路由权限与守卫

### 5.1 Skyroc 的守卫顺序

`apps/admin/src/features/router/guard.ts`：

```ts
export async function guardAdminRoute(options: AdminRouteGuardOptions) {
  const { context, location } = options;

  if (!context.isLoggedIn) {
    throw redirect({ to: '/login', search: getLoginRedirectSearch(location, context) });
  }

  const userInfo = await resolveUserInfo(context);
  await guardResolvedUserInfo(options, userInfo);
}
```

`guardResolvedUserInfo` 里依次是：用户拿不到就先 `await context.logout()` 再跳登录 → 静态模式查 `hasMatchedRoutePermission` → 动态模式查 `hasAuthorizedRoutePath` → 都不过跳 `/403`。

三个容易漏的细节：

- **先等登出走完再跳**。它的注释：`/login` 的守卫会重新读 token，没清完就跳过去会被当成还登录着。
- **redirect 参数不是无条件加的**。当前路径就是首页且没有 query 时不加，避免 `/login?redirect=/home` 这种噪音：

```ts
function getLoginRedirectSearch(location: ParsedLocation, context: Router.RouterContext) {
  const homeRoute = normalizePath(context.homeRoute || context.getHomeRoute());
  const currentPath = normalizePath(location.pathname);

  if (currentPath === homeRoute && !location.searchStr) return;

  return { redirect: location.href };
}
```

- **静态权限查的是每一层 match，不只是叶子**：`matches.every(match => hasRoutePermission(match.staticData, userInfo))`。父级布局无权时子页面也不该进。

### 5.2 不迁 React Router loader

Skyroc 用 TanStack Router 的 `beforeLoad`，天然在渲染前执行。**本项目不能照搬，因为路由表本身是从菜单数据生成的**：

```ts
// src/routers/index.tsx
const routerList = useMemo(() => {
  if (!authMenuList.length) return wrappedStaticRouter;
  return [...staticPart, ...convertToDynamicRouterFormat(authMenuList)];
}, [authMenuList]);

const router = useMemo(() => createBrowserRouter([{ HydrateFallback: Loading, children: routerList }]), [routerList]);
```

菜单必须在 router **创建之前**到位，而 loader 活在 router **内部**——把 `initAuth` 放进 loader 是鸡生蛋。真要做得先把路由表改成"稳定根路由 + `unstable_patchRoutesOnNavigation` 动态挂载"，否则菜单一变 `createBrowserRouter` 就整体重建、loader 重跑。这个前置改造的成本远大于收益，本轮不做。

而且"未登录先渲染一帧"这个问题，现有的 `ready` 门加 `<Loading />` 已经挡掉大部分。

### 5.3 改法：`RouterGuard` 同步化

现在的问题是判断写在 `useEffect` 里、依赖只有 `[loader]`，token 变化但没发生导航时不会重新判断（401 现在是靠 http 层自己 `window.$navigate` 兜的，两处逻辑互相打补丁）。

把跳转改成渲染期返回 `<Navigate replace />`，`document.title` 留在 effect：

```tsx
const meta = useLoaderData() as MetaProps;
const token = useUserStore(state => state.token);
const authMenuList = useAuthStore(state => state.authMenuList);
const { pathname, search } = useLocation();

useEffect(() => {
  const title = import.meta.env.VITE_GLOB_APP_TITLE;
  document.title = meta?.title ? `${meta.title} - ${title}` : title;
}, [meta]);

if (ROUTER_WHITE_LIST.includes(pathname)) return props.children;

const isLoginPage = pathname === LOGIN_URL;

if (!token && !isLoginPage) {
  const fullPath = pathname + search;
  // 首页且无 query 时不带 redirect
  const query = fullPath === HOME_URL ? '' : `?redirect=${encodeURIComponent(fullPath)}`;
  return <Navigate replace to={LOGIN_URL + query} />;
}

if (token && authMenuList.length && isLoginPage) return <Navigate replace to={HOME_URL} />;

return props.children;
```

`window.$navigate = navigate` 保持现状（必须在首个请求发出前就绪，挪进 effect 会晚一步）。

`LoginForm` 消费 redirect 时必须过白名单，只放行站内路径：

```ts
function isSafeRedirect(value: string) {
  return value.startsWith('/') && !value.startsWith('//');
}
```

### 5.4 本项目不需要授权路径索引

Skyroc 的 `hasAuthorizedRoutePath` 在非 dynamic 模式直接返回 `true`：

```ts
// packages/web/admin-layouts/src/features/menus/use-menus.ts
export function hasAuthorizedRoutePath(path: string, userInfo?: Api.Auth.UserInfo | null) {
  const { routeMode } = getAdminLayoutsOptions();
  if (routeMode !== 'dynamic') return true;

  const menu = getQuickReferenceMenuByPath(path);
  return Boolean(menu && hasRoutePermission(menu, userInfo));
}
```

它需要这个判定，是因为它的路由树来自本地文件（所有页面都注册着），菜单才来自后端，两者存在差集。

**本项目的路由表是从菜单生成的**（`ConvertRouter` 只为菜单项建路由），无权路径压根不存在于路由表里，会落到 `*`。路由权限已经由构造保证，不需要再建一套路径索引。唯一缺口是语义：无权 URL 现在报 404 而不是 403。如果要对齐，在 `*` 兜底里判断"有 token 且路径不在 `flatMenuList` 中"渲染 403 即可，属于可选项。

三种权限的边界照旧：菜单权限管侧栏展示，路由权限管手输 URL 能否进页面，按钮权限管操作是否展示，**三者都不是安全边界**。真正的边界在后端，每个敏感接口都必须再校验一次。按钮权限继续用 `useAuthButton`，不新造组件。

## 6. 路由缓存与 Tabs 身份

### 6.1 Skyroc 的缓存实现不可移植

它没用通用 KeepAlive 库，而是给每个缓存页存一份 TanStack Router 状态快照，再造一个"假 router"渲染它（`packages/web/admin-layouts/src/modules/AdminContent.tsx`）：

```ts
function createSnapshotRouter(router: AnyRouter, routeState: RouterStateSnapshot) {
  const snapshotRouter = Object.assign(Object.create(Object.getPrototypeOf(router)), router) as AnyRouter;

  snapshotRouter.__store = createStaticRouterStore(routeState) as unknown as AnyRouter['__store'];
  snapshotRouter.latestLocation = routeState.location;

  return snapshotRouter;
}
```

隐藏页用 `display: none` 保留，激活页写入最新 router state、隐藏页保留上次激活的快照，所以隐藏页不会跟着当前 URL 读到别人的路由状态。

这是对 `__store`、`latestLocation`、`RouterContextProvider` 的深度内部操作，**React Router 没有对应物，不要尝试等价实现**。本项目继续用 `keepalive-for-react`。

### 6.2 可移植的部分：缓存身份

Skyroc 的身份函数只有 5 行：

```ts
// packages/web/admin-layouts/src/state/tabs/shared.tsx
export function getTabIdByRoute(pathname: string, multiTab: boolean, fullPath: string) {
  let id = pathname;
  if (multiTab) id = fullPath;
  return id;
}
```

本项目 `Main` 里 `cacheKey = pathname + search`，等于所有页面默认开多实例：列表页每换一次查询参数就多一个标签和一个缓存实例。

改法只有两步：

- `MetaProps` 增加 `multiTab?: boolean`，默认 `false`；只有详情、编辑等确实需要并行的页面显式开启。
- 新增 `getTabId(pathname, fullPath, multiTab)`（放 `src/utils/menu.ts`，与既有菜单助手同层），`Main` 的 cacheKey 和 Tabs 的 `path` 都从它取值，禁止各算一份。

Skyroc 另有一个 `contentKey`（multi 时 `fullPath`，否则 `pathname`）用于"身份不变但要重新挂载"。**这一层不需要移植**：`keepalive-for-react` 内部已经用 `renderCount` 实现了同一件事——每个缓存项存一个 `renderCount`，React key 是 `${cacheKey}-${renderCount}`，`aliveRef.current.refresh(cacheKey)` 只把它 +1。身份与重挂载已经是分开的两个维度，项目侧只需要决定 cacheKey 怎么算。

### 6.3 Tab 校验：不加字段，校验时反查菜单

Skyroc 在 Tab 上存了两个字段（`id` 是身份、`routePath` 是路由路径），校验用后者。本项目**不照抄这个结构**：`TabsListProp` 走的是 `tabs-state` 持久化，加字段就要处理存量数据，而项目已经决定不再使用 `version` + `migrate`（见 7 的施工细节 3）。

更简单的等价做法是校验时反查菜单，`src/utils/menu.ts` 里现成的 `getMenuByPath()` 已经处理了动态参数（内部把 `:param` 换成 `.*` 做正则匹配），只需要先剥掉查询串：

```ts
validateTabs: () => {
  const { flatMenuList } = useAuthStore.getState();
  const keep = !item.closable || Boolean(getMenuByPath(flatMenuList, item.path.split('?')[0]).path);
  ...
}
```

这样 2.2 的 bug 修掉了，`TabsListProp` 不变、`tabs-state` 结构不变、不需要迁移。附带好处是 `validateTabs` 不再需要调用方传 `validPaths`，`usePermissions` 里那段拼 `validPaths` 的代码可以一起删。

Skyroc 那个 `findTabByRoutePath`（`tab.id === routePath || tab.id.startsWith(routePath + '?')`）在需要按路由反查标签时可以借用同一个思路，本项目当前没有这个消费点，不提前加。

### 6.4 隐藏页副作用（缓存类页面最容易踩的坑）

**这是缓存相关问题中最高频、也最该优先处理的一条**，已有真实项目踩到：两个详情页 A、B 都开缓存，从 A 切到 B 之后，在 B 上看到 A 的详情接口被调用。

根因只有一句：**隐藏不等于卸载**。隐藏页的组件实例还在，effect、query、定时器、订阅全都还活着。具体有三条路径，症状不同，修法也不同：

| 路径                                                             | 症状                               |
| ---------------------------------------------------------------- | ---------------------------------- |
| 1. cacheKey 不含区分参数，A 和 B 是同一个实例                    | B 显示 A 的数据，刷新时发 A 的请求 |
| 2. 隐藏的 A 仍响应依赖变化，用自己 mount 时捕获的 id 发请求      | 在 B 上看到 A 的接口被调用         |
| 3. 隐藏的 A 从 `useParams` / `useSearchParams` 读到全局 location | A 发出 B 的请求，表现为重复请求    |

先分清是哪一条，在详情页里加一行就够：

```tsx
const { active, _cacheKey } = useKeepAliveContext();
console.log(_cacheKey, active, id);
```

切 A→B 看输出：只打印出一个 `_cacheKey` 是路径 1（身份没分开）；打印出两个、隐藏那个 `active: false` 且 `id` 还是自己的是路径 2；隐藏那个的 `id` 变成了对方的是路径 3。

修法：

- **路径 1** 属于身份问题，cacheKey 必须包含区分参数，也就是 6.2 里的 `multiTab: true`。详情页是 `multiTab` 存在的主要理由。
- **路径 2 和 3 统一用活跃状态门**：

```tsx
const { active } = useKeepAliveContext();

const { data } = useQuery({
  queryKey: ['orderDetail', id],
  queryFn: () => getOrderDetail(id),
  enabled: active && Boolean(id)
});
```

普通副作用把 `useEffect` 换成 `useEffectOnActive(cb, deps, skipMount?)`，一次性初始化用 `useEffectOnCreate`。

`enabled: active` 能同时挡住路径 2 和 3：隐藏期间根本不发请求，至于 id 读对还是读错都不再有影响；而页面被激活时 URL 一定是它自己的，`useParams` 读到的又是对的。**所以绝大多数"缓存页乱发请求"根本不需要动 Location 隔离**（见 6.7），先把活跃门加上。

两个边界要知道：

- `enabled: false` 不会取消已经在飞的请求，只是不再发起新的。
- ProTable 的 `request` 是命令式的（`queryClient.fetchQuery`），不吃 `enabled`。列表页只有在有人主动调 `actionRef.reload()` 时才会在隐藏状态下发请求，需要的话在调用处判断 `active`。

`keepalive-for-react` 还有一个 `enableActivity` 属性：开启后隐藏页改用 React 19.2 的 `<Activity mode="hidden">` 而不是 `display: none`（库内部读 `React.Activity`，取不到回落 `Fragment`）。它的类型注释明确写了 `useEffect will trigger when the component is active`——等于把上面的活跃门下沉到框架层，但同时会在隐藏时清理 Effect、激活时重建，图表实例、表单状态、WebSocket、定时器都要逐个验证，本轮不启用。

### 6.5 缓存上限

`max={15}` 到顶后由缓存库淘汰实例，但 Tab 可能还留着，出现"标签在、状态没了"。模板优先把上限设得足够大、销毁完全由关闭标签驱动，行为最容易解释。

### 6.6 页面缓存不等于服务端数据缓存

`keepalive-for-react` 保留组件实例、React state 和 DOM；TanStack Query 缓存接口数据与失效策略。两者不能互相替代。关闭页面实例不必删所有 Query 数据；**退出登录和切换用户必须** `queryClient.clear()`。

### 6.7 隐藏页 Location 隔离（已知缺口，暂不补）

Skyroc 保存 router state 快照的真正目的不是缓存本身，而是**隔离**：激活项写入最新状态、隐藏项保留上次激活时的快照，所以隐藏页不会跟着当前 URL 读到别人的路由状态。

本项目用 `keepalive-for-react`，隐藏页组件仍然共享全局 `LocationContext`。页面 A 缓存在后台时调 `useLocation()`，拿到的是当前那个页面的 URL。

**先明确它不解决什么**：6.4 的活跃状态门已经挡掉了绝大多数症状——隐藏期间不发请求，激活时 URL 又一定是自己的。Location 隔离要补的只剩一种情况：**页面在隐藏期间仍然需要读到正确的 URL**（比如隐藏时还要跑一段依赖 URL 的计算、或者要把 URL 存进自己的状态）。这类需求少见，所以顺序上一定是先加活跃门、确认还有残留问题再考虑本节。

本项目当前也不发作：`useLocation` / `useMatches` 的全部调用都在 `layouts/`（常驻组件）和 `RouterGuard` 里，`views/` 下零处读 URL。

社区常见的补法是冻结 context：

```tsx
import { UNSAFE_LocationContext } from 'react-router-dom';

const FrozenRouter = ({ children }: { children: ReactNode }) => {
  const context = useContext(UNSAFE_LocationContext);
  const frozen = useRef(context).current;

  return <UNSAFE_LocationContext.Provider value={frozen}>{children}</UNSAFE_LocationContext.Provider>;
};
```

它的局限必须写清楚，否则会被当成通用方案照抄：

- 只冻结 `LocationContext`。`useMatches`、`useLoaderData` 读的是 route context 和 data router state，仍然会串。
- 用 `UNSAFE_` 前缀 API，React Router 升级必须回归。
- **它无条件冻结首帧，和 6.2 的** `multiTab: false` **直接冲突**：身份变成 `pathname` 之后，激活页自己的 query 变化也会被一起冻住，页面读到旧参数。

Skyroc 没有这个矛盾，因为它是**按激活状态区分**的，不是无条件冻结。要用 React Router 表达同一个规则，形状应该是：

```tsx
const { active } = useKeepAliveContext();
const live = useContext(UNSAFE_LocationContext);
const snapshot = useRef(live);

// 激活时持续写入最新，隐藏时停在最后一次激活的值
if (active) snapshot.current = live;
```

渲染期写 ref 这一点，Skyroc 的 `AdminContent` 也是同样做法（`keepAliveEntriesRef.current = keepAliveEntries`）。

**本轮不做**，理由不是"缺口不重要"，而是活跃门已经覆盖了它的绝大部分价值，剩下的边角要用 `UNSAFE_` API 换、还和 `multiTab` 耦合，需要回归测试来兜，而项目没有测试基建。触发条件：加完活跃门仍然观察到隐藏页读错 URL 时再动手，届时先评估 `keepalive-for-react-router@5.0.7`（peer 为 `keepalive-for-react ^5.0.7`、`react-router >=6`，与当前 5.0.11 兼容）的官方集成是否已经覆盖，不要一上手就写 `UNSAFE_` 代码。

## 7. 实施顺序

**当前状态：本文为方案定稿，四批改动均未落地，代码保持原样。** 动手前先读本节末尾的"施工细节"，其中一条会改变批次顺序（批次 3 先于批次 2）。

无测试运行器，每批的验收方式统一为：`pnpm type:check` + `pnpm lint:eslint` + dev 运行时冒烟。文件改名或移动后必须重启 dev server 再验。

四批的性价比不同，不必一次做完：

| 批次 | 性质         | 判断                                                                      |
| ---- | ------------ | ------------------------------------------------------------------------- |
| 1    | 已有实证的坑 | 隐藏页活跃门已在真实项目发作过（见 6.4），优先级最高且改动局部。          |
| 2    | 架构级收益   | 认证收口是唯一的架构级改善，约 7 个文件。                                 |
| 3    | 修正确性漏洞 | 守卫依赖不全是实打实的洞，成本低。                                        |
| 4    | 提前支出     | `multiTab` 只有在真的要并行开详情页时才需要，模板阶段可只加约定不改默认。 |

### 第 1 批：隐藏页活跃门 + 修 bug（互不耦合，风险最低）

1. **建立缓存页数据获取的项目约定：`enabled: active` 与 `useEffectOnActive`（6.4）**，并在模板里放一个可切换的详情页示例，让这条约定有地方看。
2. blob / arraybuffer 响应分流（3.1），顺带修 `HttpError.code` 收 `undefined`。
3. `validateTabs` 改为反查菜单（2.2、6.3），顺带删掉 `usePermissions` 里拼 `validPaths` 的那段。
4. 删重试死代码（3.6）。

冒烟：开两个详情页互相切换，隐藏那个不再发请求，网络面板里不出现对方 id 的请求；blob 下载成功、下载失败能看到后端 JSON 错误文案；带 query 的标签刷新后仍在。

### 第 2 批：认证收口

1. 导出单例 `queryClient`，建立 `clearAuth`，三处调用点统一（4.2）。
2. `cancelAllRequest` 并接进 `clearAuth`（3.2）。
3. 错误提示按消息去重，替换 401 全局布尔（3.3）。**注意现有那个全局布尔同时承担"只登出一次"，换成按消息去重时这个语义要单独保住。**
4. 登录时按身份判断是否清标签（4.2）。

冒烟：手动退出与 401 行为一致；退出时在途请求被取消；同一账号重登标签保留；换账号后标签、`userInfo`、Query 数据都不残留。

**冷启动会话校验（4.4）不进本批。** 它要先有 `getUserInfo` 接口，属于后端契约到位后的补充项。模板现在没有这个接口，也没有 `initAuth` 语义，先补一个 mock 只是把结构摆出来，收益要等接真实后端才兑现——留作可选项，不占本批工期。

### 第 3 批：守卫

1. `RouterGuard` 同步化 + `isSafeRedirect`（5.3）。
2. 可选：无权 URL 落 403（5.4）。

冒烟：未登录访问保护页不闪一帧业务内容；登录后回到原站内地址；`?redirect=//evil.com` 被拒；已登录访问 `/login` 被 replace 到首页。

### 第 4 批：缓存身份

1. `MetaProps.multiTab`、统一 `getTabId`（6.2、6.3）。

冒烟：列表页换查询参数不新增标签；两个详情页并行保留各自状态；关闭、批量关闭、刷新、菜单变化都正确销毁缓存。

### 施工细节（动手前先定，都是核对代码后确认会撞到的）

**执行顺序：批次 3 应排在批次 2 之前。** 守卫同步化之后，`clearAuth` 只需要清状态——token 一空，`RouterGuard` 重渲染就会自己 `<Navigate>` 到登录页，跳转变成清理的自然结果。这正是 Skyroc 的分工（`logout()` 只清、守卫负责跳）。若先做批次 2，`clearAuth` 就得自己承担跳转，等批次 3 落地又要拆掉。

**1. `cancelAllRequest` 必须独立成文件，否则出现循环依赖。** `utils/auth.ts` 要用 `cancelAllRequest`（在 http 里），而 http 的 401 分支要用 `clearAuth`（在 auth 里）。虽然本项目已有类似的惰性循环（`stores/modules/tabs.ts` → `@/utils` → `@/stores`）且能跑，但不该再加一条。落法：把 abortController 和 `cancelAllRequest` 放 `src/utils/http/cancel.ts`，它不 import 任何业务模块；`http/index.ts` 和 `utils/auth.ts` 都只依赖它，环就断了。

**2. `clearAuth` 不负责跳转**（前提是批次 3 已完成），也不需要现在那个 `LOGOUT_DELAY = 500`。延迟原本是为了让 401 提示先露出来再跳，而 antd 的 `message` 挂在 `App` context 上、位置高于 router，跳转不会打断它。

**3. 不给 Tab 加字段，也不引入 persist 迁移。** 项目已移除 `global-state` 与 `user-state` 的 `version` + `migrate`（历史包袱清理），后续也不走这条路。因此 `validateTabs` 的修法改成校验时反查菜单，`TabsListProp` 与 `tabs-state` 结构保持不变，见 6.3。

**4. 反查菜单用现成的 `getMenuByPath()`，不要自己解析路径。** `useMatches()` 只给解析后的 `pathname`，拿不到路由模板，动态参数路由（`/user/:id`）没法从 matches 反推菜单 path。`src/utils/menu.ts` 里的 `getMenuByPath()` 已经用 `menu.path?.replace(/:.[^/]*/, '.*')` 做了正则匹配，传入剥掉查询串的 pathname 即可。

**5. `LoginForm` 消费 redirect 时不能动现有跳转顺序。** 那里的 `navigate(HOME_URL)` 必须留在 `initPermissions` 之前（文件里有注释说明：晚了 `LoginForm` 会先被卸载，动态 router 首挂会落在 `/login` 闪一帧）。加 redirect 只是把目标换成 `isSafeRedirect(redirect) ? redirect : HOME_URL`，位置不动。

**6. 错误去重替换 401 布尔时，"只登出一次"要单独保住。** 现在那个 `isUnauthorizedErrorShown` 同时干两件事：压重复提示、保证只登出一次。按消息去重只覆盖第一件，第二件需要独立的 in-flight 标记，否则并发 401 会触发多次 `clearAuth`。

### 不在任何批次里的已知缺口

隐藏页 Location 隔离（6.7）。触发条件是"加完活跃门仍然观察到隐藏页读错 URL"，届时单独立项。

## 8. 本轮明确不做

- 不迁 TanStack Router、不迁 Jotai、不改 monorepo。
- 不迁 React Router loader（理由见 5.2）。
- 不引入 `@skyroc/axios` 整包，也不引入 `axios-retry`、`qs`、`nanoid`。
- 不引入 `RequestAdapter`、`createFlatRequest`、请求加密。
- **不重构 axios 拦截器结构**，不抽选项式钩子或命名接缝（理由见 3.8）。axios 层只做 3.1、3.2、3.3 三个逻辑点加删死代码。
- 不引入 `contentKey`：缓存库的 `renderCount` 已覆盖（见 6.2）。
- 不开启 `enableActivity`（见 6.4）。
- 不补隐藏页 Location 隔离，也不写 `FrozenRouter`（理由与触发条件见 6.7）。
- 不实现续签：后端契约未定前不做假续签（规则已记录在 3.7）。
- 不建授权路径索引（理由见 5.4）。
- 不引入 i18n。
- 不把所有页面默认设成 `multiTab` 或 `keepAlive`。
- 不把按钮隐藏当安全控制。
- **不引入测试运行器**。Skyroc 有 `vitest.config.ts`，本项目没有测试基建，引入 vitest 加 testing-library 加一整套 auth / request / router / cache 测试矩阵，对极简模板是一笔独立的重大决策，需要单独立项，不夹在本轮里。
- 不按 `urls/api/hooks/keys` 拆 API 模块：`src/api/modules` 现在只有 `login.ts` 一个消费者，不满足"新抽象需 ≥2 个真实消费者"。

## 9. 参考源码

### Skyroc（本文引用过的）

```text
packages/@core/axios/src/index.ts                              createRequest、cancelAllRequest、拦截器
packages/@core/axios/src/shared.ts                             transformResponse、blob/arraybuffer 解信封
packages/@core/axios/src/options.ts                            默认项、retries: 0
packages/@core/axios/src/type.ts                               RequestOption、onBackendFail 契约
packages/@core/service/src/request/token-refresh.ts            单飞续签、复用窗口
packages/@core/service/src/request/error-handler.ts            业务码分岔、递归续签保护
packages/@core/service/src/request/shared.ts                   错误消息去重、续签请求识别
packages/@core/service/src/request/types.ts                    RequestAdapter、ServiceCodes
apps/admin/src/features/auth/use-auth.ts                       setAuth / initAuth / logout
apps/admin/src/features/auth/use-login.ts                      登录后用户切换判定
apps/admin/src/features/router/guard.ts                        守卫顺序、redirect 规则
packages/web/admin-layouts/src/features/menus/use-menus.ts     hasAuthorizedRoutePath
packages/web/admin-layouts/src/features/menus/permissions.ts   角色判定纯函数
packages/web/admin-layouts/src/modules/AdminContent.tsx        Router State 快照缓存
packages/web/admin-layouts/src/state/tabs/shared.tsx           getTabIdByRoute、标签工具
packages/web/admin-layouts/src/state/tabs/use-admin-tab.ts     标签生命周期
```

在线文档：[https://admin-docs.skyroc.me/docs/admin](https://admin-docs.skyroc.me/docs/admin)

### 本项目对应位置

```text
src/utils/http/index.ts                        拦截器、401、重试死代码
src/utils/http/error.ts                        HttpError、提示、断网跳 500
src/utils/download.ts                          blob 下载消费端
src/routers/index.tsx                          路由表生成、菜单门
src/routers/helper/RouterGuard.tsx             守卫
src/routers/helper/ConvertRouter.tsx           菜单转路由
src/routers/interface/index.ts                 MetaProps
src/hooks/usePermissions.ts                    菜单/权限初始化
src/stores/modules/{user,auth,tabs}.ts         登录态、菜单、标签
src/layouts/components/Main/index.tsx          KeepAlive 接线
src/layouts/components/Tabs/index.tsx          标签追加
src/utils/keepAlive.ts                         缓存命令式操作
src/views/login/components/LoginForm.tsx       登录流程
src/main.tsx                                   queryClient
```

## 10. 许可

Skyroc 使用 MIT License，Copyright (c) 2026 Ohh。本文 3.1、3.2、3.3、6.2、6.3 属于代码级借鉴，落地时在对应文件头部保留出处与许可声明。
