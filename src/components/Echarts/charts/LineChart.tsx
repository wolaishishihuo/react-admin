import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildLineOption } from './options';
import { type AxisChartProps, isSeriesEmpty, type LineSeries } from './types';

const EMPTY_AXIS: string[] = [];

export interface LineChartProps extends AxisChartProps {
  data: number[] | LineSeries[];
  xAxisData?: string[];
  smooth?: boolean;
  lineWidth?: number;
  symbol?: LineSeries['symbol'];
  symbolSize?: number;
  showAreaColor?: boolean;
  animationDelay?: number;
}

const LineChart = (props: LineChartProps) => {
  const {
    animationDelay = 200,
    data,
    xAxisData = EMPTY_AXIS,
    height = '16rem',
    loading = false,
    isEmpty = false,
    onClick,
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

  return (
    <ChartFrame
      loading={loading}
      onClick={onClick}
      option={option}
      height={height}
      width='calc(100% + 10px)'
      seriesDelay={animationDelay}
      empty={isEmpty || isSeriesEmpty(data)}
    />
  );
};

export default LineChart;
