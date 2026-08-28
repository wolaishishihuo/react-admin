# 路由：生成与使用

本文说明两件事：`src/pages` 里的文件如何变成可访问 URL；登录后侧边栏、进页权限、Tabs、缓存如何使用这棵树。契约条目见 `docs/ARCHITECTURE.md`。

**不并存。** `static` 和 `dynamic` 都实现了，但一次进程里只能跑一种：`.env` 的 `VITE_AUTH_ROUTE_MODE`（默认 `static`）。改开关后要重启 dev / 重新构建，整站切换，不能「这一页 static、那一页 dynamic」。

先记住**两棵树**：

| 树                                | 谁生成                                                                   | 决定什么                                              |
| --------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| 本地文件路由树                    | TanStack Router 插件扫描 `src/pages`，写入 `src/router/routeTree.gen.ts` | 页面组件、URL、布局嵌套。**没有本地文件就没有页面。** |
| 授权导航树 `AuthorizedNavigation` | `src/features/navigation`                                                | 侧边栏、403、keepAlive / multi / activeMenu、按钮码   |

页面永远由文件路由渲染。后端 `element` 一律忽略。授权树从哪来，只取决于**当前**这个开关。

改菜单/授权时按职责打开这些文件（步骤和契约仍看本文）：

| 文件                                        | 运行时                 | 职责                          |
| ------------------------------------------- | ---------------------- | ----------------------------- |
| `src/features/navigation/route-mode.ts`     | 读开关                 | `VITE_AUTH_ROUTE_MODE`        |
| `src/features/navigation/menu-query.ts`     | 按开关二选一           | 组装授权树                    |
| `src/features/navigation/menu-tree.ts`      | 两种都会用到           | pathMap、可见菜单、面包屑     |
| `src/features/navigation/menu-model.ts`     | 两种都会用到           | 组件读取授权树和选中项        |
| `src/router/guard.ts`                       | 两种都会用到，判定不同 | 登录、403/404、外链           |
| `src/features/navigation/menu-generate.ts`  | 仅当前是 static 才走   | 从 `(admin)` 文件树生成侧边栏 |
| `src/features/navigation/dynamic-routes.ts` | 仅当前是 dynamic 才走  | 按本地 catalog 裁当前账号菜单 |

## 1. 当前开关下会发生什么

开关读取处：`src/features/navigation/route-mode.ts`。菜单 Query key 含该值和 session epoch，换用户不会串菜单。

### `static`（默认）

```text
文件树 staticData ──► 侧边栏 / 授权集合 ──► Guard 只问「本地有没有这个文件」
```

不请求 `/menu/list`。侧边栏、进页、Tab、keepAlive、按钮码都读 `staticData`。没有 `staticData` 的节点不进菜单，也不会把子路由提到上一级，所以分组要自己写带 `title` 的 `layout.tsx`。本地没有这个文件 → 404。`(errors)/403.tsx` 不会因为菜单权限被走到。

### `dynamic`

```text
后端菜单按本地文件裁剪 ──► 侧边栏 / 授权集合 ──► Guard 再问「账号菜单有没有」
```

登录后拉**当前账号**菜单。没有本地文件就没有页面。菜单 path 对不上本地 `fullPath` 时，**这一项连 children 一起丢掉**（有本地文件的子页也不会提到上一级），直接打开会 403。

因此后端父菜单 `/list` 必须能对上本地某条路由，通常就是 `list/layout.tsx`。只建子页、父级在菜单里却没有本地路由，整个分组会消失。不要传 `element`，也不要指望后端 `redirect` 来授权。

|                          | 行为                                  |
| ------------------------ | ------------------------------------- |
| 菜单接口 `/menu/list`    | 登录后请求当前账号的树                |
| 侧边栏从哪来             | 后端菜单，但 path 必须能对上本地文件  |
| 对不上本地文件的后端节点 | 整项丢掉，下级一并丢掉                |
| 已登录、本地有这个文件   | 还要当前账号菜单里有这条 `originPath` |
| 本地没有这个 path        | 404                                   |
| 本地有文件、账号菜单没有 | 403（`(errors)/403.tsx`）             |

侧边栏、进页、Tab 的 `keepAlive` / `multi` / `activeMenu` / 按钮码读菜单 `handle`（与 `meta` 等价）。`staticData` 仍表示「本地有这个文件」，并给标题、外链、以及人还停在这页时的缓存 pane。

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

## 2. 加页维护哪一份：钉死一种，还是以后要改开关

这是**仓库怎么写**，不是运行时第三种模式。

| 你打算                       | 加页时维护什么                                                           |
| ---------------------------- | ------------------------------------------------------------------------ |
| 一直只用 static              | 本地文件 + `staticData`。可以不管 `menu.json` / 菜单接口                 |
| 一直只用 dynamic             | 本地文件 + 菜单 path / `handle`。分组**父级 path 自身也要有本地路由**    |
| 以后可能改开关（本仓库示例） | 两份都写、字段对齐。改 `.env` 重启后侧边栏才还在。**改开关前仍只跑一种** |

以后可能改开关时按下面想，不要只顾当前 `.env`：

1. **先有文件。** 哪种模式都不会靠后端 `element` 变出页面。
2. **分组父级要有能生成该 path 的文件**（`list/layout.tsx`）。static 靠它的 `staticData.title` 进侧边栏；dynamic 靠这条 path 对上后端父节点。缺文件时：static 子页不会被提到上一级；dynamic 整棵子树丢掉。
3. **叶子写两份元数据。** `staticData` 给 static；菜单 `handle` 给 dynamic。要改开关后观感一致，就把 title / icon / hide / order / keepAlive / multi / activeMenu / buttons 写成一样的（对照表在第 1 节）。
4. **keepAlive 两边都写。** static 只看 `staticData`；dynamic 的 Tab 看 `handle.keepAlive`，当前页 pane 仍可读 `staticData.keepAlive`。只写文件、菜单写 `false`：改成 dynamic 后离开再回来会丢缓存。
5. **纯 redirect 的 `index.tsx` 不要写 `staticData`**，否则 static 侧边栏会多一项。dynamic 的父级用 layout 的 path，不要用这个 index 当菜单节点。
6. **隐藏页**（详情、`$userId`）static 写 `menu.hide`；dynamic 菜单里仍要有这条 path（可 `hideInMenu`），否则改成 dynamic 后账号打不开。

## 3. 文件如何变成 URL

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
| `(errors)/403.tsx`                          | `/403`                     | 仅当前是 dynamic：本地有文件、账号菜单没有                 |
| `(errors)/500.tsx`                          | `/500`                     | 离线等                                                     |

## 4. `staticData`

每个会进侧边栏或需要 keepAlive / 按钮码的后台页都应声明 `staticData`（类型是 `src/router/context.ts` 的 `RouteMeta`）。纯 redirect 的 index 不要写。

当前是 static 时，侧边栏和缓存都读它。当前是 dynamic 时，它仍是「本地有这个文件」的声明；侧边栏字段以菜单 `handle` 为准，对照见第 1 节。

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
| `keepAlive`       | static：切走再回来是否保留实例。dynamic：人还停在这页时有没有缓存 pane           |
| `menu.icon`       | 侧边栏图标                                                                       |
| `menu.hide`       | 不出现在侧边栏（详情页常用），但仍可授权进入                                     |
| `menu.order`      | 同级排序                                                                         |
| `menu.activeMenu` | 隐藏页高亮哪条菜单                                                               |
| `tab.multi`       | `true` 时每个完整 URL 一个 Tab（详情）                                           |
| `tab.fixed`       | 不可关闭                                                                         |
| `buttons`         | static 的页面按钮码，`useAuthButton()` 读取                                      |
| `href`            | 外链。守卫从后往前找带 `href` 的 match，打开后离开当前页。不要写在分组 layout 上 |

## 5. 添加一个后台页面

三种维护策略都要先做：

1. 在 `src/pages/(admin)/...` 建文件，导出 `Route = createFileRoute(...)`，写 `component` 和 `staticData`。
2. 私有逻辑放同目录 `modules/`，不要新建路由文件。
3. 跑一次 `pnpm dev` 或 `pnpm routes:check`，确认 `routeTree.gen.ts` 出现新节点并提交。

然后按第 2 节补齐：

- **钉死 static：** 到此为止。分组用带 `title` 的 `layout.tsx`；redirect 用的 `index.tsx` 不要写 `staticData`。隐藏详情同时写 `menu.hide` 和 `menu.activeMenu`。
- **钉死 dynamic：** 再在 `src/features/navigation/mock/menu.json`（或真实菜单接口）补同一条 **path**（含分组父级）。path 用 URL 形态：`/list/useProTable`，动态段写成 `/users/:userId`（运行时会转成 `$userId`）。
- **以后可能改开关：** `staticData` 和菜单 `handle` 都写，字段对齐；父级 layout 和菜单父 path 都要有。

## 6. 身份：不要用 pathname 做授权

`useRoute()`（`src/router/use-route.ts`）给出三个值：

| 字段         | 例子（打开 `/users/42?tab=info`） | 用途                                                                    |
| ------------ | --------------------------------- | ----------------------------------------------------------------------- |
| `originPath` | `/users/$userId`                  | 守卫、菜单选中、按钮权限、Tab 的 `routePath`、cache key 的非 multi 部分 |
| `pathname`   | `/users/42`                       | 当前具体路径                                                            |
| `fullPath`   | `/users/42?tab=info`              | multi Tab 的 id、真正要导航回去的地址                                   |

`originPath` 取 **matches 最后一个** 的路由模板 `fullPath`（去掉 query），不是浏览器 pathname。`/users/42` 和 `/users/99` 是同一个授权对象。

列表 `tab.multi: false`：Tab id = `originPath`，search 变化不新开标签。详情 `tab.multi: true`：Tab id = `fullPath`，每个查询串一个标签。

## 7. 守卫与跳转

`(admin)/layout.tsx` 的 `beforeLoad` 调用 `guardAdminRoute`：

1. 无 token → `/login`（从 `/home` 进来不带 `redirect`）。
2. 初始化用户失败 → `revokeSession`，再去登录。
3. 先鉴权，再看 matched 里是否有 `staticData.href`。非 preload 时打开新窗口，当前页不是首页则回 `/home`，已经是首页则回 `/404`。不要把 `href` 写在分组 layout 上（会把子页一起带走）。hover preload 不打开、不跳转。
4. 其余按第 1 节当前开关判定 404 或 403。

登录页 `redirect` 只接受站内路径。跨模块跳转用 `navigateTo('/list/useProTable')`（`src/router/router-ref.ts` 的 `history.push`）。缓存 pane 里的 `useNavigate` 可能写到 snapshot store，看起来跳了、真路由没动。

按钮：`const { BUTTONS } = useAuthButton()`。static 读 `staticData.buttons`；dynamic 读菜单 `buttons`。

## 8. Tabs 与缓存

菜单就绪后按 `originPath` `upsertTab`。就绪后 `validateTabs(pathSet)`：不在授权里的 Tab 全丢掉（包括 fixed）；当前页失权则 `router.invalidate()`，交给 Guard。

缓存 pane 用 `display:none` 挂着，活动 pane 每次写入最新 `router.state`。非缓存页走活 `Outlet`，切走即卸。刷新只 bump `contentRevision`。关闭 Tab 同步丢掉 cache entry。内部快照字段只允许 `src/layouts/cache/snapshot-router.ts` 碰。

- **当前是 static：** 在 `staticData.keepAlive` 写 `true` 即可。切走再回来、人还停在这页，都走这份。
- **当前是 dynamic：** Tab 是否缓存跟菜单 `handle.keepAlive`（显式 `false` 不会被文件 `true` 盖掉）。人还停在这页时，pane 仍可读 `staticData.keepAlive`。菜单关了、文件开了：停着有 pane，离开后卸掉。以后可能改开关时，两边都写成 `true`。

## 9. 看不懂时先对这几条

- 侧边栏没有新页面：是不是写在 `modules/` 里了；`staticData.title` 有没有；`menu.hide` 是否误开。当前是 dynamic 时还要看菜单是否漏了 path，以及**父级 path 有没有本地路由**。
- 打开后变成 404：URL 没匹配到任何文件路由（`routeTree.gen.ts` 里没有），或动态段没写成 `$param`。
- 打开后变成 403：只会发生在当前是 dynamic——本地有文件，账号菜单没有这条 path（父级被裁掉时，子页也会变成这样）。
- 详情高亮丢了：补 `menu.activeMenu`（dynamic 时菜单里也要有）。
- 侧边栏有分组、点分组没子项：分组 layout 写了 `title`，但子页没写 `staticData`（static）；或菜单子 path 对不上本地文件（dynamic）。
- Tab 跳了页面没变：改成 `navigateTo`，不要在缓存页里 `useNavigate`。
- `routes:check` 失败：先 `pnpm routes:generate`（实际是一次 development 构建），把更新后的 `routeTree.gen.ts` 提交。
- 改开关后菜单乱了：不是并存失效，是改开关前没把 `staticData` 和菜单 `handle` 对齐，见第 2 节。改完 `.env` 必须重启。
