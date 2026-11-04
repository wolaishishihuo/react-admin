import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildBarOption } from './options';
import { type AxisChartProps, type BarSeries, isSeriesEmpty } from './types';

const EMPTY_AXIS: string[] = [];

export interface BarChartProps extends AxisChartProps {
  data: number[] | BarSeries[];
  xAxisData?: string[];
  barWidth?: string | number;
  stack?: boolean;
  borderRadius?: number | number[];
  horizontal?: boolean;
}

const BarChart = (props: BarChartProps) => {
  const {
    data,
    xAxisData = EMPTY_AXIS,
    height = '16rem',
    loading = false,
    isEmpty = false,
    onClick,
    barWidth,
    stack = false,
    borderRadius = 4,
    horizontal = false,
    colors,
    showAxisLabel = true,
    showAxisLine = true,
    showSplitLine = true,
    showTooltip = true,
    showLegend = false,
    legendPosition = 'bottom'
  } = props;
  const option = useThemedOption(
    theme =>
      buildBarOption({
        theme,
        data,
        xAxisData,
        barWidth: barWidth ?? (horizontal ? '36%' : '40%'),
        stack,
        borderRadius,
        horizontal,
        colors,
        flags: { showAxisLabel, showAxisLine, showSplitLine, showTooltip, showLegend, legendPosition }
      }),
    [
      data,
      xAxisData,
      barWidth,
      stack,
      borderRadius,
      horizontal,
      colors,
      showAxisLabel,
      showAxisLine,
      showSplitLine,
      showTooltip,
      showLegend,
      legendPosition
    ]
  );

  return (
    <ChartFrame loading={loading} onClick={onClick} option={option} height={height} empty={isEmpty || isSeriesEmpty(data)} />
  );
};

export default BarChart;
