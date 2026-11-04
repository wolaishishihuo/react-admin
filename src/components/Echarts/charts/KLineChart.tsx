import { useThemedOption } from '../useChartTheme';
import { buildKLineOption } from './advancedOptions';
import ChartFrame from './ChartFrame';
import type { BaseChartProps, CandlestickDatum } from './types';

export interface KLineChartProps extends BaseChartProps {
  data: CandlestickDatum[];
  showDataZoom?: boolean;
  dataZoomStart?: number;
  dataZoomEnd?: number;
}

const KLineChart = (props: KLineChartProps) => {
  const { data, colors, showDataZoom, dataZoomStart, dataZoomEnd, height, loading, isEmpty, onClick } = props;
  const option = useThemedOption(
    theme => buildKLineOption(theme, props),
    [data, colors, showDataZoom, dataZoomStart, dataZoomEnd]
  );
  const empty = isEmpty || !data.length;

  return <ChartFrame option={option} height={height} loading={loading} empty={empty} onClick={onClick} />;
};

export default KLineChart;
