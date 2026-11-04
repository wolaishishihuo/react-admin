import { useMemo } from 'react';

import ChartFrame from '@/components/Echarts/charts/ChartFrame';
import { buildSparkBarOption, buildSparkLineOption } from '@/components/Echarts/charts/options';
import useChartTheme from '@/components/Echarts/useChartTheme';
import PercentText from '@/components/PercentText';

export interface MetricChartCardProps {
  value: number;
  label: string;
  percentage: number;
  date?: string;
  /** 卡片高度，单位 rem。迷你图会把走势收到右上角 */
  height?: number;
  mini?: boolean;
  chart: 'line' | 'bar';
  data: number[];
  showArea?: boolean;
  barWidth?: string;
  /** 不传则用主题色 light-1 */
  color?: string;
}

const MetricChartCard = (props: MetricChartCardProps) => {
  const {
    value,
    label,
    percentage,
    date,
    height = 11,
    mini = false,
    chart,
    data,
    showArea = false,
    barWidth = '26%',
    color
  } = props;
  const theme = useChartTheme();
  const empty = !data.length;
  const option = useMemo(
    () =>
      chart === 'line' ? buildSparkLineOption(theme, data, showArea, color) : buildSparkBarOption(theme, data, barWidth, color),
    [theme, data, chart, showArea, barWidth, color]
  );
  const plotHeight = mini ? '60px' : `calc(${height}rem - 5rem)`;

  return (
    <div className='chart-card card relative overflow-hidden' style={{ height: `${height}rem`, padding: 0 }}>
      <div
        className={
          chart === 'line' ? 'mb-2.5 p-5 flex items-start justify-between' : 'mb-5 px-5 pt-5 flex items-start justify-between'
        }
      >
        <div>
          <p className={`text-2xl font-medium m-0 ${chart === 'line' ? 'leading-none' : 'leading-tight'}`}>{value}</p>
          <p className={`text-sm m-0 mt-1 ${chart === 'line' ? 'text-content-pale' : 'chart-card-secondary'}`}>{label}</p>
        </div>
        <PercentText value={percentage} className={mini ? 'absolute bottom-5 left-5 text-sm' : 'text-sm'} />
      </div>
      {date ? (
        <div className={`text-xs bottom-5 right-5 absolute ${chart === 'line' ? 'text-content-pale' : 'chart-card-secondary'}`}>
          {date}
        </div>
      ) : null}
      <div className={mini ? 'absolute top-5 right-5 w-2/5' : 'absolute right-0 bottom-0 left-0'} style={{ height: plotHeight }}>
        <ChartFrame option={option} height='100%' empty={empty} />
      </div>
    </div>
  );
};

export default MetricChartCard;
