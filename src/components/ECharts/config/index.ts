import { BarChart, LineChart, LinesChart, PieChart, ScatterChart, RadarChart, GaugeChart } from 'echarts/charts';
import type {
  BarSeriesOption,
  LineSeriesOption,
  LinesSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  RadarSeriesOption,
  GaugeSeriesOption
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  PolarComponent,
  GeoComponent,
  ToolboxComponent
} from 'echarts/components';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption
} from 'echarts/components';
import * as echarts from 'echarts/core';
import type { ComposeOption } from 'echarts/core';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

export type ECOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | LinesSeriesOption
  | PieSeriesOption
  | RadarSeriesOption
  | GaugeSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | ScatterSeriesOption
>;

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  PolarComponent,
  GeoComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  LinesChart,
  PieChart,
  ScatterChart,
  RadarChart,
  GaugeChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  SVGRenderer
]);

/** 统一 tooltip 主题样式 */
export const getTooltipStyle = (isDark: boolean, trigger: 'item' | 'axis' = 'axis'): TooltipComponentOption => ({
  trigger,
  backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
  borderColor: isDark ? '#333' : '#ddd',
  borderWidth: 1,
  textStyle: { color: isDark ? '#fff' : '#333' }
});

export default echarts;
