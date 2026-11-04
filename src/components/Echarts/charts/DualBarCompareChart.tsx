import { useThemedOption } from '../useChartTheme';
import { buildDualBarOption } from './advancedOptions';
import ChartFrame from './ChartFrame';
import type { AxisChartProps } from './types';

export interface DualBarCompareChartProps extends AxisChartProps {
  positiveData: number[];
  negativeData: number[];
  xAxisData: string[];
  positiveName?: string;
  negativeName?: string;
  barWidth?: number | string;
  yAxisMin?: number;
  yAxisMax?: number;
  showDataLabel?: boolean;
  positiveBorderRadius?: number | number[];
  negativeBorderRadius?: number | number[];
}

const DualBarCompareChart = (props: DualBarCompareChartProps) => {
  const {
    positiveData,
    negativeData,
    xAxisData,
    positiveName,
    negativeName,
    barWidth,
    yAxisMin,
    yAxisMax,
    showDataLabel,
    positiveBorderRadius,
    negativeBorderRadius,
    colors,
    showAxisLabel,
    showAxisLine,
    showSplitLine,
    showTooltip,
    showLegend,
    legendPosition,
    height,
    loading,
    isEmpty,
    onClick
  } = props;
  const option = useThemedOption(
    theme => buildDualBarOption(theme, props),
    [
      positiveData,
      negativeData,
      xAxisData,
      positiveName,
      negativeName,
      barWidth,
      yAxisMin,
      yAxisMax,
      showDataLabel,
      positiveBorderRadius,
      negativeBorderRadius,
      colors,
      showAxisLabel,
      showAxisLine,
      showSplitLine,
      showTooltip,
      showLegend,
      legendPosition
    ]
  );
  const empty = isEmpty || (!positiveData.length && !negativeData.length);

  return <ChartFrame option={option} height={height} loading={loading} empty={empty} onClick={onClick} />;
};

export default DualBarCompareChart;
