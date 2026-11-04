import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildScatterOption } from './options';
import type { AxisChartProps, ScatterDatum } from './types';

export interface ScatterChartProps extends AxisChartProps {
  data: ScatterDatum[];
  symbolSize?: number;
}

const ScatterChart = (props: ScatterChartProps) => {
  const {
    data,
    height = '16rem',
    loading = false,
    isEmpty = false,
    onClick,
    symbolSize = 14,
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
      buildScatterOption({
        theme,
        data,
        symbolSize,
        colors,
        flags: { showAxisLabel, showAxisLine, showSplitLine, showTooltip, showLegend, legendPosition }
      }),
    [data, symbolSize, colors, showAxisLabel, showAxisLine, showSplitLine, showTooltip, showLegend, legendPosition]
  );
  const empty = !data.length || data.every(item => !item.value.length);

  return <ChartFrame loading={loading} onClick={onClick} option={option} height={height} empty={isEmpty || empty} />;
};

export default ScatterChart;
