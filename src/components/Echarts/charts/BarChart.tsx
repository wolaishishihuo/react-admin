import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildBarOption } from './options';
import { type AxisChartProps, type BarSeries, isBarLikeEmpty } from './types';

const EMPTY_AXIS: string[] = [];

interface BarChartProps extends AxisChartProps {
  data: number[] | BarSeries[];
  xAxisData?: string[];
  barWidth?: string | number;
  stack?: boolean;
  borderRadius?: number;
  horizontal?: boolean;
}

const BarChart = (props: BarChartProps) => {
  const {
    data,
    xAxisData = EMPTY_AXIS,
    height = '16rem',
    barWidth = '40%',
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
        barWidth,
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

  return <ChartFrame option={option} height={height} empty={isBarLikeEmpty(data)} />;
};

export default BarChart;
