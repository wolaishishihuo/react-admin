# 表格与 ProTable 规范

搭建管理列表页、调整表格滚动或内嵌表格前阅读本文。完整接入范例见 `src/views/system/accountManage/index.tsx`。

## 1. 选型与请求归属

- 业务管理列表优先使用 `@ant-design/pro-components` 的 `ProTable`，复用列配置、搜索区、工具栏与分页；弹窗 / 详情页的轻量展示表格可用 antd `Table`。
- 默认由 ProTable 的 `request` 调用 `fetchXxx` 并经 `formatDataForProTable` 适配，通过表单、`params`、`actionRef.reload()` 管理查询与刷新，**不再套 TanStack Query 缓存同一份列表**。
- 确需跨视图共享 Query 缓存时，整体改为 Query 驱动的 `dataSource` / `loading` 并显式接管分页、筛选、排序，不同时让 `request` 和 Query 请求同一列表。

## 2. 自适应高度与内部滚动

- **独立管理列表页默认**：给 ProTable 设置 `className='ant-pro-table-scroll'` 与 `scroll={{ x: ..., y: '100%' }}`。`src/styles/proTable.css` 已全局引入，与主布局配合自动分配剩余高度，搜索区、工具栏、表头与分页保留在滚动区外。
- `scroll.x` 按实际列宽计算具体数值或 `'max-content'`，不要照搬其他页面。
- **上方有统计卡 / 外层容器时**：页面采用纵向 flex，顶部统计区不收缩，表格包裹容器设 `flex: 1; min-height: 0`。高度异常先排查 flex 收缩链；CSS 能解决的，**禁止测量 DOM、读 `window.innerHeight`、写死 `calc(100vh - 固定像素)` 或新增高度 hook**。
- **慎用 `ant-pro-table-scroll` 开关**：主布局检测到活动页含该类名会关闭外层滚动。长内容页、弹窗/详情内嵌表格、多表格页必须先明确外层滚动容器，不得机械套用该类名或 `scroll.y: '100%'`，否则会裁切内容。

## 3. 标准配置与样式约定

- 标准列表沿用 `bordered` / `cardBordered`、`search={{ labelWidth: 'auto' }}`；分页复用 `@/config/proTable` 的 `pagination`（按需覆盖），无分页显式传 `pagination={false}`。
- `rowKey` 使用稳定业务 id；同页多个搜索表单时确保 `form.name` 唯一。
- 工具栏操作按钮放 `toolBarRender`（公共样式已统一「操作按钮居左、设置图标居右」）；树形展开图标已由 `src/config/proTable.tsx` 和全局 `ConfigProvider` 提供。
- 表格列等较完整配置放同页 `config/columns.tsx`；依赖权限、回调或数据时导出工厂函数并显式传参，不在配置文件读取隐式页面状态。
- 不在页面复制整套 `.ant-table-*` / `.ant-pro-*` 覆写，也不为默认外观外包一层 `Card`；共性调整改公共配置 / 样式，局部差异限制在页面作用域。

## 4. 验收检查项

调整表格结构或布局后，核对以下场景无内容裁切、无双重纵向滚动条、分页不被挤出视口：

1. 窗口缩放（桌面宽屏 → 中屏）
2. 搜索区展开 / 收起
3. 空数据态与多行数据态
4. 翻页与改变 `pageSize`
5. KeepAlive 缓存页切出再切回
