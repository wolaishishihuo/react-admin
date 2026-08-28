# 路由：生成与使用

本文说明两件事：`src/pages` 里的文件如何变成可访问 URL；登录后侧边栏、进页权限、Tabs、缓存如何使用这棵树。契约条目见 `docs/ARCHITECTURE.md`。

先记住**两棵树**：

| 树                                | 谁生成                                                                   | 决定什么                                              |
| --------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| 本地文件路由树                    | TanStack Router 插件扫描 `src/pages`，写入 `src/router/routeTree.gen.ts` | 页面组件、URL、布局嵌套。**没有本地文件就没有页面。** |
| 授权导航树 `AuthorizedNavigation` | `src/features/navigation`                                                | 侧边栏、403、keepAlive / multi / activeMenu、按钮码   |

后端菜单只授权本地已有 path，`element` 一律忽略。页面永远由文件路由渲染。

## 1. 文件如何变成 URL

插件配置在 `build/plugins.ts`：`routesDirectory: ./src/pages`，`generatedRouteTree: ./src/router/routeTree.gen.ts`，`routeToken: 'layout'`（目录里的 `layout.tsx` 才是布局路由）。

`pnpm dev` 会边改边生成。提交前跑 `pnpm routes:check`：先完整 `vite build` 再 `git diff --exit-code` 对 `routeTree.gen.ts`。该文件禁止手改，必须入库，否则 CI 会报生成物漂移。

### 目录约定

括号分组**不进入 URL**：`(admin)` / `(auth)` / `(errors)` 只用来挂布局和守卫。

| 文件形态                                      | 作用                   | 例子                                                                           |
| --------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| `layout.tsx`                                  | 布局路由，包裹子页面   | `(admin)/layout.tsx` 是后台壳；`(admin)/list/layout.tsx` 是 `/list` 分组壳     |
| `index.tsx`                                   | 该目录的索引页         | `(admin)/home/index.tsx` → `/home`                                             |
| `$param.tsx`                                  | 动态段，URL 里是具体值 | `(admin)/users/$userId.tsx` → `/users/42`，授权 identity 仍是 `/users/$userId` |
| `modules/`、`components/`                     | **不是路由**，插件忽略 | 页面私有表格配置、表单放这里                                                   |
| `loading.tsx` / `error.tsx` / `not-found.tsx` | **不是路由**           | 只给 `__root.tsx` 当 pending / error / 未知 URL                                |

`src/pages/__root.tsx` 是根：有 token 则 `initializeSession`；未知 URL 走 `not-found.tsx`。显式访问 `/404` 是 `(errors)/404.tsx`，和「匹配失败」不是同一条路。

### 当前页面对照

| 文件                                        | URL                        | 角色                                                       |
| ------------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| `pages/index.tsx`                           | `/`                        | 重定向到 `/home`                                           |
| `(admin)/layout.tsx`                        | （无额外段）               | `AdminLayout` + `guardAdminRoute`                          |
| `(admin)/home/index.tsx`                    | `/home`                    | 首页，固定 Tab                                             |
| `(admin)/list/layout.tsx`                   | `/list`                    | 侧边栏父级「列表页面」                                     |
| `(admin)/list/index.tsx`                    | `/list`                    | 无 `staticData`，`beforeLoad` 重定向到 `/list/useProTable` |
| `(admin)/list/useProTable/index.tsx`        | `/list/useProTable`        | 标准缓存列表                                               |
| `(admin)/list/useProTable/detail/index.tsx` | `/list/useProTable/detail` | `tab.multi` 详情                                           |
| `(admin)/users/$userId.tsx`                 | `/users/$userId`           | 动态段；菜单里写 `/users/:userId`                          |
| `(auth)/login/layout.tsx` + `index.tsx`     | `/login`                   | 已登录则跳走                                               |
| `(errors)/403.tsx`                          | `/403`                     | **仅 dynamic**：本地有文件、当前账号菜单没有               |
| `(errors)/500.tsx`                          | `/500`                     | 离线等                                                     |

分组父级必须自己写 `layout.tsx` 并带 `staticData.title`（见 `list/layout.tsx`）。没有 `staticData` 的节点不会进菜单，也不会把子路由提到上一级。纯 redirect 的 `index.tsx` **不要写 `staticData`**，否则侧边栏会多出一项。

## 2. `staticData`

每个会进侧边栏或需要 keepAlive / 按钮码的后台页都应声明 `staticData`（类型是 `src/router/context.ts` 的 `RouteMeta`）。static 模式侧边栏直接读它；dynamic 模式它仍表示「本地有这个文件」，并且**停在当前页时**可用 `keepAlive` 给缓存 pane 兜底。纯 redirect 的 index 不要写。

```tsx
export const Route = createFileRoute('/(admin)/list/useProTable/')({
  component: UseProTable,
  staticData: {
    title: '用户列表',
    keepAlive: true,
    menu: { icon: 'ri:apps-line', order: 1 },
    tab: { multi: false },
    buttons: ['add', 'edit', 'delete']
  }
});
```

| 字段              | 作用                                                                             | 后端 `handle` / `meta` 对应 |
| ----------------- | -------------------------------------------------------------------------------- | --------------------------- |
| `title`           | 文档标题、Tab 名；分组 layout 必填                                               | `title`（否则 `name`）      |
| `keepAlive`       | 停在当前页时是否建缓存 pane；Tab 是否缓存仍看菜单项                              | `keepAlive`                 |
| `menu.icon`       | 侧边栏图标                                                                       | `icon`                      |
| `menu.hide`       | 不出现在侧边栏（详情页常用），但仍可授权进入                                     | `hideInMenu`                |
| `menu.order`      | 同级排序                                                                         | `order`                     |
| `menu.activeMenu` | 隐藏页高亮哪条菜单                                                               | `activeMenu`                |
| `tab.multi`       | `true` 时每个完整 URL 一个 Tab（详情）                                           | `multiTab`                  |
| `tab.fixed`       | 不可关闭                                                                         | `fixedIndexInTab != null`   |
| `buttons`         | static 无菜单接口时的按钮码                                                      | `buttons`                   |
| `href`            | 外链。守卫从后往前找带 `href` 的 match，打开后离开当前页。不要写在分组 layout 上 | `href`                      |

## 3. 添加一个后台页面

1. 在 `src/pages/(admin)/...` 建文件，导出 `Route = createFileRoute(...)`，写 `component` 和 `staticData`。
2. 私有逻辑放同目录 `modules/`，不要新建路由文件。
3. 跑一次 `pnpm dev` 或 `pnpm routes:check`，确认 `routeTree.gen.ts` 出现新节点并提交。
4. **`VITE_AUTH_ROUTE_MODE=dynamic` 时还要**在 `src/features/navigation/mock/menu.json`（或真实菜单接口）补同一条 **path**。path 用 URL 形态：`/list/useProTable`，动态段写成 `/users/:userId`（运行时会转成 `$userId`）。本地文件树没有这条 path 时，这一项连同它的下级一起丢掉。不要传 `element`，也不要指望后端 `redirect` 来授权。

父级菜单用 `list/layout.tsx` 这种带 `title` 的 layout，而不是空目录。需要 `/list` 落到子页时，再写一个**不要 `staticData`** 的 `list/index.tsx` 做 `redirect`。

隐藏详情页同时写 `menu.hide: true` 和 `menu.activeMenu: '/list/useProTable'`，否则侧边栏选中会丢。

## 4. 身份：不要用 pathname 做授权

`useRoute()`（`src/router/use-route.ts`）给出三个值：

| 字段         | 例子（打开 `/users/42?tab=info`） | 用途                                                                    |
| ------------ | --------------------------------- | ----------------------------------------------------------------------- |
| `originPath` | `/users/$userId`                  | 守卫、菜单选中、按钮权限、Tab 的 `routePath`、cache key 的非 multi 部分 |
| `pathname`   | `/users/42`                       | 当前具体路径                                                            |
| `fullPath`   | `/users/42?tab=info`              | multi Tab 的 id、真正要导航回去的地址                                   |

`originPath` 取 **matches 最后一个** 的路由模板 `fullPath`（去掉 query），不是浏览器 pathname。`/users/42` 和 `/users/99` 是同一个授权对象。

列表 `tab.multi: false`：Tab id = `originPath`，search 变化不新开标签。详情 `tab.multi: true`：Tab id = `fullPath`，每个查询串一个标签。

## 5. static / dynamic 运行时

开关是 `.env` 的 `VITE_AUTH_ROUTE_MODE`，读取处：`src/features/navigation/route-mode.ts`。菜单 Query key 含该值和 session epoch，换用户不会串菜单。

|                          | `static`（默认）                         | `dynamic`                             |
| ------------------------ | ---------------------------------------- | ------------------------------------- |
| 菜单接口 `/menu/list`    | 不请求                                   | 登录后请求**当前账号**的树            |
| 侧边栏从哪来             | `(admin)` 文件树里带 `staticData` 的节点 | 后端菜单，但 path 必须能对上本地文件  |
| 对不上本地文件的后端节点 | —                                        | 整项丢掉，下级一并丢掉                |
| 已登录、本地有这个文件   | 放行                                     | 还要当前账号菜单里有这条 `originPath` |
| 本地没有这个 path        | 404                                      | 404                                   |
| 本地有文件、账号菜单没有 | 不会发生（不看菜单接口）                 | 403                                   |

```text
static:  文件树 staticData ──► 侧边栏 / 授权集合 ──► Guard 只问「本地有没有这个文件」
dynamic: 后端菜单按本地文件裁剪 ──► 侧边栏 / 授权集合 ──► Guard 再问「账号菜单有没有」
```

`keepAlive` / `multi` / `activeMenu`：static 读 `staticData`；dynamic 读菜单项的 `handle`（和 `meta` 是同一份字段）。后端 `element`、`redirect` 都不参与授权。

## 6. 守卫与跳转

`(admin)/layout.tsx` 的 `beforeLoad` 调用 `guardAdminRoute`：

1. 无 token → `/login`（从 `/home` 进来不带 `redirect`）。
2. 初始化用户失败 → `revokeSession`，再去登录。
3. 先鉴权，再看 matched 里是否有 `staticData.href`。非 preload 时打开新窗口，当前页不是首页则回 `/home`，已经是首页则回 `/404`。不要把 `href` 写在分组 layout 上（会把子页一起带走）。hover preload 不打开、不跳转。
4. 其余按上一节 static / dynamic 判定 404 或 403。

登录页 `redirect` 只接受站内路径。跨模块跳转用 `navigateTo('/list/useProTable')`（`src/router/router-ref.ts` 的 `history.push`）。缓存 pane 里的 `useNavigate` 可能写到 snapshot store，看起来跳了、真路由没动。

按钮：`const { BUTTONS } = useAuthButton()`，码来自当前模式菜单的 `buttons` / `staticData.buttons`。

## 7. Tabs 与缓存怎么用这棵树

两处 keepAlive 不要当成一回事：

| 谁                                        | 读什么                                                                                                       | 效果                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `src/layouts/Tabs` 写入的 `tab.keepAlive` | 当前模式菜单项；菜单里没有这条 path 才回落 `staticData.keepAlive`。菜单项是 `false` 就不会被本地 `true` 覆盖 | 离开后再切回来会不会保留这个 Tab 对应的 pane                                                   |
| `AdminContent` 的当前页 pane              | **始终**看 `route.staticData.keepAlive`                                                                      | 人还停在这页时有没有 pane。dynamic 下后端关了缓存、本地写了 `true` 时：停着有 pane，离开后卸掉 |

菜单 Query 成功后按 `originPath` `upsertTab`。`multi` 同样优先菜单项。就绪后 `validateTabs(pathSet)`：不在授权里的 Tab 全丢掉（包括 fixed）；当前页失权则 `router.invalidate()`，交给 Guard 去 403。

缓存 pane 用 `display:none` 挂着，活动 pane 每次写入最新 `router.state`。非缓存页走活 `Outlet`，切走即卸。刷新只 bump `contentRevision`。关闭 Tab 同步丢掉 cache entry。内部快照字段只允许 `src/layouts/cache/snapshot-router.ts` 碰。

## 8. 看不懂时先对这几条

- 侧边栏没有新页面：是不是写在 `modules/` 里了；`staticData.title` 有没有；dynamic 是否漏了 `menu.json` 的 path；`menu.hide` 是否误开。
- 打开后变成 403：本地有文件，账号菜单没有这条 path（只会发生在 dynamic）。
- 打开后变成 404：URL 没匹配到任何文件路由（`routeTree.gen.ts` 里没有），或动态段没写成 `$param`。
- 详情高亮丢了：补 `menu.activeMenu`。
- 侧边栏有分组、点分组没子项：分组 layout 写了 `title`，但子页没写 `staticData`。
- Tab 跳了页面没变：改成 `navigateTo`，不要在缓存页里 `useNavigate`。
- `routes:check` 失败：先 `pnpm routes:generate`（实际是一次 development 构建），把更新后的 `routeTree.gen.ts` 提交。
