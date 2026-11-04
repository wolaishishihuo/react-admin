# ECharts 图表

引擎锁定 `echarts@6.1.0`，渲染依赖为 `zrender@6.1.0`。图表配置与中国地图数据参考 Art Design Pro（参考版本使用 ECharts 6.0.0）；许可证见 `ART-LICENSE`。

## 6.1.0 兼容

- 保留新版本默认的坐标轴图形防溢出行为（`axis.containShape`），不额外关闭。升级前后使用相同数据、尺寸、字体和主题，对 27 组图表的明暗主题共 54 张静态画布进行比较，样本逐像素一致；这不代表任意数据或动画全过程均与参考版本一致。
- 当前封装未使用 `tooltip.valueFormatter` 或 `axis.startValue`。后续自定义配置需注意：`valueFormatter` 第二个参数改为原始数据索引，`startValue` 不再兼任 `min`。
- 新版本能力仍通过现有容器和主题接入，无需额外增加 `useEcharts`。官方变更见 [6.1.0 release](https://github.com/apache/echarts/releases/tag/6.1.0)。

## 使用

业务页从 `@/components/Echarts/charts` 导入：

```tsx
import { BarChart, KLineChart, LineChart, MapChart } from '@/components/Echarts/charts';

<BarChart data={[10, 20]} xAxisData={['一月', '二月']} loading={loading} />;
<LineChart data={series} xAxisData={months} showAreaColor showLegend />;
<KLineChart data={candles} showDataZoom />;
<MapChart height='32rem' scatterData={cities} onRegionClick={handleRegionClick} />;
```

覆盖纵向柱、横向柱、单/多系列、堆叠柱、折线/面积、环形/饼图、雷达、散点、双向柱、K 线、中国地图。横向柱使用 `BarChart horizontal`，饼图使用 `RingChart radius={['0%', '70%']}`。折线支持每系列面积配置和首次展示的系列间隔 `animationDelay`；数据与主题更新直接交给 ECharts 的更新动画，不再先归零。

指标卡位于 `cards/MetricChartCard`（`chart='line' | 'bar'`、`mini`、`showArea`）；环形指标卡位于 `cards/DonutChartCard`。卡片高度以 rem 为单位，基础图表高度支持 CSS 字符串或像素数值。

## 职责与数据契约

- 页面负责取得数据、持有筛选状态和决定业务空态；图表只消费 props。真实接口的普通展示数据按项目规范由 API 模块和 TanStack Query 管理，图表不创建请求、缓存或 Zustand 状态。
- 演示数据留在演示页面或对应 `config/`。本地常量无需包装成请求，也不创建虚构的 `urls.ts` / Query hooks。地图城市标记通过 `scatterData` 传入，基础组件不内置演示城市。
- `charts/` 将数据转换为 option 并统一展示状态；`theme.ts` 管公共视觉配置；底层容器管理实例、事件、尺寸和清理。自定义图表沿用容器与主题；已有标准组件能表达时直接使用。
- 柱、线、散点、雷达、K 线和趋势卡中的 `0` 是有效数据。没有记录或所有系列都没有观测值才自动显示空态；双向柱只有两侧都无数据才为空。业务若约定全零为空，由页面计算后传 `isEmpty`。
- 饼图、环形图及环形卡片用于展示占比，数据全零时仍显示空态。正负值如何转成比例属于调用侧业务契约，组件不擅自转换。
- 折线坐标覆盖正负数据并包含零；单系列柱也支持 `colors`，不传时保留主题渐变。每系列 `showAreaColor` 优先于全局配置，透明度 `0` 会原样使用。

## 主题与生命周期

- `useTheme` 写入 `theme.ts` 的 `--hooks-chart*` 语义变量，`useChartTheme` 等主题更新后读取。图表保留项目主色，色阶按 Art 的向下取整算法生成；同主色、主题、字体、数据和尺寸才具有视觉可比性。
- 页面不直接导入 ECharts，也不另写颜色。个性化图表通过公共 ECharts 容器和主题扩展；可复用图形加入 `charts/`。
- 容器进入可视范围且尺寸非零时初始化；通过原生 `ResizeObserver` 统一观察容器变化，不额外订阅布局 store 或重复监听窗口 resize。`isResize` 只控制已有实例自动调尺寸，切换时保留实例和交互。React Activity 隐藏和卸载时清理实例、观察器、计时器，恢复后重新初始化。
- option 的 memo 用于避免无关渲染重复调用第三方 `setOption`；保持依赖完整，新增配置时同步更新依赖。它不负责保证实例存活，实例生命周期由 ref 和 effect 管理。
- 所有基础图表支持 `loading` 和 `isEmpty`。地图 GeoJSON 独立异步加载；加载失败明确显示错误，与「暂无数据」区分。`mapData` 可提供区域数据，`selectedRegion` 控制区域，`onRegionClick` 返回名称、行政代码与级别。
- 引擎入口只注册当前实际使用的图表与组件。新增仪表盘、标线、工具箱等能力时，在 `config/index.ts` 显式补对应注册；仅扩展 `ECOption` 配置不会自动注册运行时模块。

## 有意修正的参考行为

- 删除系列后清除对应图形，单/多系列切换不继承旧系列名；更新保留图例选择。
- 数据更新保留用户缩放，只有显式改变 `dataZoomStart` / `dataZoomEnd` 才重置。
- 强制空态响应 `isEmpty` 变化；参考组件部分状态不在 watchSources 中，切换时可能不生效。
- K 线 tooltip 使用原始 OHLC 字段，避免 ECharts 6 内部维度序号造成错位；地图 tooltip 对文本做 HTML 编码。

## 验证

自动回归：`pnpm exec vitest run tests/components/Echarts`。覆盖真实 ECharts 的系列删除、面积和堆叠切换、图例选择与用户缩放保留，以及组件的零值、空态、错误、容器 resize、回调更新和 Activity / StrictMode 清理。负数范围、大数组、配色覆盖、面积开关与透明度、首次动画和地图标记也有回归用例。

类型检查：`pnpm type:check`；修改代码后针对受影响文件执行 ESLint；调整引擎注册或资源集成时执行 `pnpm build:pro`。视觉与动画仍需在浏览器核查，单元测试不证明像素一致或动画全过程一致。
