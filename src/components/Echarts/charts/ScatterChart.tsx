import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildScatterOption } from './options';
import type { AxisChartProps, ScatterDatum } from './types';

interface ScatterChartProps extends AxisChartProps {
  data: ScatterDatum[];
  symbolSize?: number;
}

const ScatterChart = (props: ScatterChartProps) => {
  const {
    data,
    height = '16rem',
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
  const empty = !data.length || data.every(item => item.value.every(value => value === 0));

  return <ChartFrame option={option} height={height} empty={empty} />;
};

export default ScatterChart;
