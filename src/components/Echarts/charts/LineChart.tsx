import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildLineOption } from './options';
import { type AxisChartProps, isBarLikeEmpty, type LineSeries } from './types';

const EMPTY_AXIS: string[] = [];

interface LineChartProps extends AxisChartProps {
  data: number[] | LineSeries[];
  xAxisData?: string[];
  smooth?: boolean;
  lineWidth?: number;
  symbol?: LineSeries['symbol'];
  symbolSize?: number;
  showAreaColor?: boolean;
}

const LineChart = (props: LineChartProps) => {
  const {
    data,
    xAxisData = EMPTY_AXIS,
    height = '16rem',
    smooth = true,
    lineWidth = 2.5,
    symbol = 'none',
    symbolSize = 6,
    showAreaColor = false,
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
      buildLineOption({
        theme,
        data,
        xAxisData,
        smooth,
        lineWidth,
        symbol,
        symbolSize,
        showAreaColor,
        colors,
        flags: { showAxisLabel, showAxisLine, showSplitLine, showTooltip, showLegend, legendPosition }
      }),
    [
      data,
      xAxisData,
      smooth,
      lineWidth,
      symbol,
      symbolSize,
      showAreaColor,
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

export default LineChart;
