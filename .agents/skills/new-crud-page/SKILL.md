---
name: new-crud-page
description: >-
  Creates a standard CRUD admin management page in this React Admin template
  (API module, ProTable list page, columns factory, create/edit modal, button
  permissions, menu wiring, and verification). Use when the user asks to add a
  new management/list/CRUD page or business module under src/views/.
---

# 新增标准 CRUD 管理页

按以下顺序一次生成并接入完整的管理页，不提前创建未消费的空文件。优先对齐当前仓库已有的业务管理页（若尚未删除模板示例，可参考 `src/views/system/accountManage/` 与 `src/apis/modules/system/`）；即使示例页已全部删除，下方步骤与专题文档中的标准骨架也完全自包含。

## 前置阅读

执行前按需查阅两份专题规范：

- API / HTTP / TanStack Query：`src/apis/README.md`
- ProTable 列表与自适应滚动：`docs/pro-table.md`

## 执行步骤

1. **确认范围与契约**
   - 明确 `<domain>`、`<page>`（camelCase，如 `system/orderManage`）、列表字段、表单字段、按钮权限码与接口来源（真实接口 vs 临时 mock）。
   - 检查 `src/apis/modules/login/api.ts` 的 `fetchGetAuthMenuList` 与 `src/hooks/usePermissions.ts`，确认菜单来自本地 JSON 还是后端。

2. **创建类型与 API 模块**
   - 在 `src/apis/interface/` 新增 `Req*` / `Res*` 类型（按领域分文件或补入对应文件）。
   - 在 `src/apis/modules/<module>/` 按实际使用创建：
     - `urls.ts`（真实 HTTP 接口路径，相对 `VITE_API_URL`）
     - `api.ts`（`fetchXxx`，解包 `.data` 并完成 camelCase 字段适配）
     - 仅当存在非 ProTable 的 Query 查询或需联动缓存失效时，再创建 `keys.ts` 与 `hooks.ts`
     - `index.ts`（统一 named export）

3. **创建页面文件**（`src/views/<domain>/<page>/`）
   - `config/columns.tsx`：导出 `createXxxColumns(handlers)` 工厂函数，显式传入操作回调与权限检查，不读隐式页面状态。
   - `components/<Page>FormModal.tsx`：
     - 箭头函数 + 独立 `interface XxxProps` + 首行解构；
     - `Modal` 默认顶部对齐（不加 `centered`），`Form.useForm()`，打开弹窗时在 `useEffect` 中重置并回填草稿（依赖含 `form`）；
     - 表单下拉选项等服务端数据用 TanStack Query（`enabled: open`），写操作后刷新对应所有者。
   - `index.tsx`（必须 `default export`）：
     - `ProTable` 设置 `className='ant-pro-table-scroll'`、`scroll={{ x: ..., y: '100%' }}`、`bordered`、`cardBordered`、`search={{ labelWidth: 'auto' }}`、复用 `@/config/proTable` 的 `pagination`；
     - `request` 直接调 `fetchXxx` + `formatDataForProTable`，写操作后调 `actionRef.current?.reload()`；
     - 入口按钮用 `<AuthButton authority='...' />`（只包按钮，不包 Modal）；提示统一用 `@/hooks/useMessage`；图标只用 `<Icon icon='ri:xxx' />`。

4. **接入菜单与路由**
   - 菜单 `element` 必须形如 `/<domain>/<page>/index`（前导 `/`、以 `/index` 结尾）；`ConvertRouter` 只匹配 `src/views/**/index.tsx`。
   - 仅当项目仍在用本地 `src/assets/json/authMenuList.json` 时同步更新 JSON 及 `usePermissions` 演示白名单；如已切后端菜单，不改演示 JSON，也不虚构后端配置。

5. **验证与交付**
   - 按顺序执行并报告实际结果：
     ```bash
     pnpm type:check
     pnpm exec oxlint <新增与修改的文件...>
     pnpm exec oxfmt --check <新增与修改的文件...>
     ```
   - 涉及复杂业务逻辑或 Query 联动时补充针对性单测到 `tests/` 镜像路径并运行 `pnpm test:run`；变更路由资源加载时运行 `pnpm build:pro`。
