# ProTable 开发规范

本项目标准列表页使用 React 19、Ant Design 6 和 ProComponents。

## 版本与边界

- React：`19.2.7`
- AntD：`6.5.0`
- `@ant-design/pro-components`：`3.1.14-2`
- TanStack React Query：`5.101.0`

普通分页、搜索和 CRUD 列表直接使用 `ProTable`。树表、双表、复杂汇总表、全量树接口和报表组合页不适合 ProTable request/search 模型时，直接使用原生 AntD `Table`。不创建 `AppProTable`、`useProTablePage`、请求工厂或 CRUD DSL。

## request 与查询缓存

ProTable 的 request 接收 `current` 和 `pageSize`，后端契约使用 `page` 和 `limit`。转换必须留在页面内具名 request 函数中，`queryKey` 使用转换后的最终请求参数：

```tsx
const requestRows = useCallback<NonNullable<ProTableProps<Row, Search>['request']>>(
  async ({ current: page = 1, pageSize: limit = 10, status }) => {
    const query = { page, limit, status };
    const result = await queryClient.fetchQuery({
      queryKey: ['rows', query],
      queryFn: () => getRows(query),
      retry: false
    });

    return { data: result.list, total: result.total, success: true };
  },
  [queryClient]
);
```

`retry: false` 防止 HTTP 层为一次失败重复提示。request 不捕获后伪装成成功空数据；异常继续抛出，并在 ProTable 上设置 `onRequestError={() => undefined}`，让 HTTP 层保留唯一错误提示。

分页页面可使用 `toProTableResponse(result)`，它把 `{ list, total }` 转成 `{ data, total, success: true }`。标准分页配置使用 `PRO_TABLE_PAGINATION`：默认第 1 页、默认 10 条、10/15/20/25/30 条选项和中文总数文案。

## columns 与搜索

columns 同时描述展示和搜索：

- 展示列不搜索时设置 `search: false`。
- 只搜索不展示时设置 `hideInTable: true` 和 `hideInSetting: true`。
- 状态选项使用 `valueEnum`；异步下拉通过 columns 工厂的 `fieldProps.options` 注入。
- 日期区间使用 `valueType: 'dateRange'`，request 边界统一转为 `YYYY-MM-DD`。
- 一个控件拆成多个后端字段时使用 `search.transform`，不要在页面维护第二份搜索配置。

页面根节点挂 `className='app-pro-table'`，表格卡通过 `cardProps={{ className: 'app-pro-table-card' }}` 挂类。标准列表使用 `scroll={{ x: tableWidth, y: '100%' }}`；ProTable 负责搜索、loading、分页和列设置。

## actionRef、formRef 与默认值

- `actionRef.current?.reload()`：保持当前页重新请求。
- `actionRef.current?.reload(true)`：回到第一页后重新请求。
- `actionRef.current?.reloadAndRest?.()`：清选中状态并回到第一页。
- `actionRef.current?.reset()`：清空搜索、排序、筛选并重置页码。
- `formRef.current?.getFieldsValue()`：读取导出或写操作使用的当前筛选条件。
- `formRef.current?.setFieldsValue(...)`：写入异步基地、日期等默认条件。
- `formRef.current?.submit()`：提交写入的默认条件，触发一次业务查询。

异步默认值页面应使用 `manualRequest`，并用一次性 ref 守卫：默认值准备完成后先将守卫置为 `true`，再 `setFieldsValue`，最后 `submit()`，避免空条件查询和重复初始化。查询和重置都应只更新一次提交条件。

导出从 `formRef` 读取当前表单值，复用与列表相同的日期转换和基地参数，不维护第二份搜索状态。

## 删除后的空页自愈

分页接口在当前页删除到越界时可能返回空列表。request 仅在 `page > 1`、当前列表为空且 `Math.ceil(total / limit)` 小于当前页时，把 `actionRef.current?.setPageInfo?.({ current: lastPage })`，再请求最后有效页。正常空数据和全量接口不使用该逻辑。

## Modal/Form 与 useTableOperate

新增、编辑、删除继续使用 AntD `Modal`、`Form` 和 `useTableOperate`。Hook 只接收当前行数据、普通 refresh 回调和业务写入函数；成功后关闭弹窗、提示并调用 `actionRef.current?.reload()`。不要把 Modal/Form 改成 `ModalForm`，也不要在页面额外维护一套 CRUD 状态机。

## 树表与特殊报表

树表需要受控展开、异步重新播种、汇总行或多个派生表格时，直接使用 AntD `Table`，配合 `useTreeExpand` 和 `TreeExpandIcon`。资金日报、资金月报等报表保留独立 board/home/chart 查询、Tab 派生数据和图表，继续使用 `app-main` 整页滚动，不把图表塞进 ProTable 卡片。

## 高度、滚动与样式

`src/styles/proTable.less` 只通过 `.app-pro-table` 和 `.app-pro-table-card` 建立高度链：桌面端搜索区固定、表体内部滚动、分页贴底；`640px` 以下取消固定高度和纵向内滚，滚动交还页面。页面不手工测量高度，不写 `bodyStyle` 或 `cardProps.styles.body` 高度补丁。

AntD Table 的滚动选择器必须按真实 DOM 层级写在页面或项目作用域内：`.ant-table-body` 负责纵向表体，`.ant-table-content` 负责横向内容，虚拟表格使用 `.ant-table-virtual-holder`。不要用全局 `.ant-pro-*` 或 `.ant-pro-card:last-child` 选择器。

## 常见排查

- 重复请求：检查是否同时使用 `useQuery`、ProTable request 和异步默认值 effect；初始化守卫必须在 `submit()` 前置为 true。
- reload 命中旧数据：检查 `queryKey` 是否包含最终后端参数；正数 `staleTime` 时写操作必须先 invalidate。
- 重复错误提示：request 的 `fetchQuery` 设置 `retry: false`，页面使用 `onRequestError={() => undefined}`，不要在 catch 中再次提示。
- 分页字段错误：ProTable 的 `current/pageSize` 只能在 request 入口转换为后端 `page/limit`。
- 样式失效：确认根节点和卡片分别有 `.app-pro-table`、`.app-pro-table-card`，并核对 AntD 6 实际 body/content/virtual-holder 层级。
