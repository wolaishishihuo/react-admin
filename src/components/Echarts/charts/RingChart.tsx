import type { LegendPosition } from '@/components/Echarts/theme';
import { useThemedOption } from '@/components/Echarts/useChartTheme';

import ChartFrame from './ChartFrame';
import { buildRingOption } from './options';
import type { PieDatum } from './types';

const DEFAULT_RADIUS: [string, string] = ['50%', '80%'];

interface RingChartProps {
  data: PieDatum[];
  height?: string;
  radius?: [string, string];
  borderRadius?: number;
  centerText?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  /** 不传则用主题色板。传入后整盘按这个数组循环取色 */
  colors?: string[];
}

const RingChart = (props: RingChartProps) => {
  const {
    data,
    height = '16rem',
    radius = DEFAULT_RADIUS,
    borderRadius = 10,
    centerText,
    showLabel = false,
    showTooltip = true,
    showLegend = false,
    legendPosition = 'right',
    colors
  } = props;
  const option = useThemedOption(
    theme =>
      buildRingOption({
        theme,
        data,
        radius,
        borderRadius,
        centerText,
        showLabel,
        showTooltip,
        showLegend,
        legendPosition,
        colors
      }),
    [data, radius, borderRadius, centerText, showLabel, showTooltip, showLegend, legendPosition, colors]
  );
  const empty = !data.length || data.every(item => item.value === 0);

  return <ChartFrame option={option} height={height} empty={empty} />;
};

export default RingChart;
