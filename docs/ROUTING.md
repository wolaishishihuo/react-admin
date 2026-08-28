# 路由：生成与使用

本文说明两件事：`src/pages` 里的文件如何变成可访问 URL；登录后侧边栏、进页权限、Tabs、缓存如何使用这棵树。契约条目见 `docs/ARCHITECTURE.md`。

`.env` 的 `VITE_AUTH_ROUTE_MODE` **同一时间只生效一种**（默认 `static`）。按顺序往下读即可。只有把开关改成 `dynamic` 才需要第 6 节，以及第 8 节末尾那一小段。

先记住**两棵树**：

| 树                                | 谁生成                                                                   | 决定什么                                              |
| --------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| 本地文件路由树                    | TanStack Router 插件扫描 `src/pages`，写入 `src/router/routeTree.gen.ts` | 页面组件、URL、布局嵌套。**没有本地文件就没有页面。** |
| 授权导航树 `AuthorizedNavigation` | `src/features/navigation`                                                | 侧边栏、403、keepAlive / multi / activeMenu、按钮码   |

页面永远由文件路由渲染。后端 `element` 一律忽略。

改菜单/授权时按职责打开这些文件（步骤和契约仍看本文）：

| 文件                                        | 谁会碰到   | 职责                          |
| ------------------------------------------- | ---------- | ----------------------------- |
| `src/features/navigation/route-mode.ts`     | 两种       | 读 `VITE_AUTH_ROUTE_MODE`     |
| `src/features/navigation/menu-query.ts`     | 两种       | 组装授权树                    |
| `src/features/navigation/menu-tree.ts`      | 两种       | pathMap、可见菜单、面包屑     |
| `src/features/navigation/menu-model.ts`     | 两种       | 组件读取授权树和选中项        |
| `src/router/guard.ts`                       | 两种       | 登录、403/404、外链           |
| `src/features/navigation/menu-generate.ts`  | 仅 static  | 从 `(admin)` 文件树生成侧边栏 |
| `src/features/navigation/dynamic-routes.ts` | 仅 dynamic | 按本地 catalog 裁当前账号菜单 |

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
| `(errors)/403.tsx`                          | `/403`                     | 账号无权时的页；默认 static 用不到，见第 6 节              |
| `(errors)/500.tsx`                          | `/500`                     | 离线等                                                     |

分组父级必须自己写 `layout.tsx` 并带 `staticData.title`（见 `list/layout.tsx`）。没有 `staticData` 的节点不会进菜单，也不会把子路由提到上一级。纯 redirect 的 `index.tsx` **不要写 `staticData`**，否则侧边栏会多出一项。

## 2. `staticData`（默认 static 就读这份）

每个会进侧边栏或需要 keepAlive / 按钮码的后台页都应声明 `staticData`（类型是 `src/router/context.ts` 的 `RouteMeta`）。默认 static 下，侧边栏、进页、Tab、缓存、按钮码都读它。纯 redirect 的 index 不要写。

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

| 字段              | 作用                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| `title`           | 文档标题、Tab 名；分组 layout 必填                                               |
| `keepAlive`       | 切走再回来是否保留页面实例；人还停在这页时有没有缓存 pane                        |
| `menu.icon`       | 侧边栏图标                                                                       |
| `menu.hide`       | 不出现在侧边栏（详情页常用），但仍可授权进入                                     |
| `menu.order`      | 同级排序                                                                         |
| `menu.activeMenu` | 隐藏页高亮哪条菜单                                                               |
| `tab.multi`       | `true` 时每个完整 URL 一个 Tab（详情）                                           |
| `tab.fixed`       | 不可关闭                                                                         |
| `buttons`         | 页面按钮码，`useAuthButton()` 读取                                               |
| `href`            | 外链。守卫从后往前找带 `href` 的 match，打开后离开当前页。不要写在分组 layout 上 |

## 3. 添加一个后台页面（默认 static）

1. 在 `src/pages/(admin)/...` 建文件，导出 `Route = createFileRoute(...)`，写 `component` 和 `staticData`。
2. 私有逻辑放同目录 `modules/`，不要新建路由文件。
3. 跑一次 `pnpm dev` 或 `pnpm routes:check`，确认 `routeTree.gen.ts` 出现新节点并提交。

父级菜单用 `list/layout.tsx` 这种带 `title` 的 layout，而不是空目录。需要 `/list` 落到子页时，再写一个**不要 `staticData`** 的 `list/index.tsx` 做 `redirect`。

隐藏详情页同时写 `menu.hide: true` 和 `menu.activeMenu: '/list/useProTable'`，否则侧边栏选中会丢。

改成 dynamic 之后加页，见第 6 节。

## 4. 身份：不要用 pathname 做授权

`useRoute()`（`src/router/use-route.ts`）给出三个值：

| 字段         | 例子（打开 `/users/42?tab=info`） | 用途                                                                    |
| ------------ | --------------------------------- | ----------------------------------------------------------------------- |
| `originPath` | `/users/$userId`                  | 守卫、菜单选中、按钮权限、Tab 的 `routePath`、cache key 的非 multi 部分 |
| `pathname`   | `/users/42`                       | 当前具体路径                                                            |
| `fullPath`   | `/users/42?tab=info`              | multi Tab 的 id、真正要导航回去的地址                                   |

`originPath` 取 **matches 最后一个** 的路由模板 `fullPath`（去掉 query），不是浏览器 pathname。`/users/42` 和 `/users/99` 是同一个授权对象。

列表 `tab.multi: false`：Tab id = `originPath`，search 变化不新开标签。详情 `tab.multi: true`：Tab id = `fullPath`，每个查询串一个标签。

## 5. 默认 static 运行时

开关读取处：`src/features/navigation/route-mode.ts`。菜单 Query key 含该值和 session epoch，换用户不会串菜单。

```text
文件树 staticData ──► 侧边栏 / 授权集合 ──► Guard 只问「本地有没有这个文件」
```

- 不请求 `/menu/list`。
- 侧边栏来自 `(admin)` 文件树里带 `staticData` 的节点。
- 已登录且本地有这个文件 → 放行；本地没有这个 path → 404。
- `keepAlive` / `multi` / `activeMenu` / 按钮码都来自 `staticData`。菜单由文件生成，所以 Tab 缓存和当前页 pane 同源。

## 6. 若改成 dynamic

把 `.env` 的 `VITE_AUTH_ROUTE_MODE` 设为 `dynamic`。登录后拉**当前账号**菜单，用裁过的树做侧边栏和进页权限。本地文件仍然必须有，没有文件就没有页面。

```text
后端菜单按本地文件裁剪 ──► 侧边栏 / 授权集合 ──► Guard 再问「账号菜单有没有」
```

加页在第 3 节之外还要：在 `src/features/navigation/mock/menu.json`（或真实菜单接口）补**同一条 path**。path 用 URL 形态：`/list/useProTable`，动态段写成 `/users/:userId`（运行时会转成 `$userId`）。本地文件树没有这条 path 时，这一项连同它的下级一起丢掉。不要传 `element`，也不要指望后端 `redirect` 来授权。

|                          | 行为                                  |
| ------------------------ | ------------------------------------- |
| 菜单接口 `/menu/list`    | 登录后请求当前账号的树                |
| 侧边栏从哪来             | 后端菜单，但 path 必须能对上本地文件  |
| 对不上本地文件的后端节点 | 整项丢掉，下级一并丢掉                |
| 已登录、本地有这个文件   | 还要当前账号菜单里有这条 `originPath` |
| 本地没有这个 path        | 404                                   |
| 本地有文件、账号菜单没有 | 403（`(errors)/403.tsx`）             |

侧边栏、进页、Tab 的 `keepAlive` / `multi` / `activeMenu` / 按钮码读菜单项的 `handle`（和 `meta` 是同一份字段）。文件上的 `staticData` 仍表示「本地有这个文件」，并给标题、外链、以及人还停在这页时的缓存 pane。

| `staticData`      | 后端 `handle` / `meta`    |
| ----------------- | ------------------------- |
| `title`           | `title`（否则 `name`）    |
| `keepAlive`       | `keepAlive`               |
| `menu.icon`       | `icon`                    |
| `menu.hide`       | `hideInMenu`              |
| `menu.order`      | `order`                   |
| `menu.activeMenu` | `activeMenu`              |
| `tab.multi`       | `multiTab`                |
| `tab.fixed`       | `fixedIndexInTab != null` |
| `buttons`         | `buttons`                 |
| `href`            | `href`                    |

后端 `element`、`redirect` 都不参与授权。

## 7. 守卫与跳转

`(admin)/layout.tsx` 的 `beforeLoad` 调用 `guardAdminRoute`：

1. 无 token → `/login`（从 `/home` 进来不带 `redirect`）。
2. 初始化用户失败 → `revokeSession`，再去登录。
3. 先鉴权，再看 matched 里是否有 `staticData.href`。非 preload 时打开新窗口，当前页不是首页则回 `/home`，已经是首页则回 `/404`。不要把 `href` 写在分组 layout 上（会把子页一起带走）。hover preload 不打开、不跳转。
4. 其余按第 5 节（static）或第 6 节（dynamic）判定 404 或 403。

登录页 `redirect` 只接受站内路径。跨模块跳转用 `navigateTo('/list/useProTable')`（`src/router/router-ref.ts` 的 `history.push`）。缓存 pane 里的 `useNavigate` 可能写到 snapshot store，看起来跳了、真路由没动。

按钮：`const { BUTTONS } = useAuthButton()`。static 读 `staticData.buttons`；dynamic 读菜单 `buttons`。

## 8. Tabs 与缓存

默认 static：在 `staticData.keepAlive` 写 `true` 即可。切到别的 Tab 再回来，页面实例还在；人还停在这页时也有缓存 pane。

菜单就绪后按 `originPath` `upsertTab`。就绪后 `validateTabs(pathSet)`：不在授权里的 Tab 全丢掉（包括 fixed）；当前页失权则 `router.invalidate()`，交给 Guard。

缓存 pane 用 `display:none` 挂着，活动 pane 每次写入最新 `router.state`。非缓存页走活 `Outlet`，切走即卸。刷新只 bump `contentRevision`。关闭 Tab 同步丢掉 cache entry。内部快照字段只允许 `src/layouts/cache/snapshot-router.ts` 碰。

仅 dynamic 时两处可能不一致：Tab 是否缓存跟菜单 `handle.keepAlive`（显式 `false` 不会被文件 `true` 盖掉）；人还停在这页时，pane 仍可读 `staticData.keepAlive`。菜单关了、文件开了：停着有 pane，离开后卸掉。

## 9. 看不懂时先对这几条

- 侧边栏没有新页面：是不是写在 `modules/` 里了；`staticData.title` 有没有；`menu.hide` 是否误开。dynamic 还要看菜单是否漏了 path。
- 打开后变成 404：URL 没匹配到任何文件路由（`routeTree.gen.ts` 里没有），或动态段没写成 `$param`。
- 打开后变成 403：只会发生在 dynamic——本地有文件，账号菜单没有这条 path。
- 详情高亮丢了：补 `menu.activeMenu`。
- 侧边栏有分组、点分组没子项：分组 layout 写了 `title`，但子页没写 `staticData`。
- Tab 跳了页面没变：改成 `navigateTo`，不要在缓存页里 `useNavigate`。
- `routes:check` 失败：先 `pnpm routes:generate`（实际是一次 development 构建），把更新后的 `routeTree.gen.ts` 提交。
