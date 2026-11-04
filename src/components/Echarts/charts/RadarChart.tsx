import type { LegendPosition } from '@/components/Echarts/theme';
import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildRadarOption } from './options';
import type { BaseChartProps, RadarIndicator, RadarSeries } from './types';

export interface RadarChartProps extends BaseChartProps {
  indicator: RadarIndicator[];
  data: RadarSeries[];
  showTooltip?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
}

const RadarChart = (props: RadarChartProps) => {
  const {
    indicator,
    data,
    loading = false,
    isEmpty = false,
    onClick,
    height = '16rem',
    showTooltip = true,
    showLegend = false,
    legendPosition = 'bottom',
    colors
  } = props;
  const option = useThemedOption(
    theme => buildRadarOption({ theme, indicator, data, showTooltip, showLegend, legendPosition, colors }),
    [indicator, data, showTooltip, showLegend, legendPosition, colors]
  );
  const empty = !data.length || data.every(item => !item.value.length);

  return <ChartFrame loading={loading} onClick={onClick} option={option} height={height} empty={isEmpty || empty} />;
};

export default RadarChart;
