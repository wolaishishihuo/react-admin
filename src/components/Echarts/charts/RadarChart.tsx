import type { LegendPosition } from '@/components/Echarts/theme';
import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildRadarOption } from './options';
import type { RadarIndicator, RadarSeries } from './types';

interface RadarChartProps {
  indicator: RadarIndicator[];
  data: RadarSeries[];
  height?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  /** 不传则用主题色板。传入后按系列下标循环取色 */
  colors?: string[];
}

const RadarChart = (props: RadarChartProps) => {
  const { indicator, data, height = '16rem', showTooltip = true, showLegend = false, legendPosition = 'bottom', colors } = props;
  const option = useThemedOption(
    theme => buildRadarOption({ theme, indicator, data, showTooltip, showLegend, legendPosition, colors }),
    [indicator, data, showTooltip, showLegend, legendPosition, colors]
  );
  const empty = !data.length || data.every(item => item.value.every(value => value === 0));

  return <ChartFrame option={option} height={height} empty={empty} />;
};

export default RadarChart;
