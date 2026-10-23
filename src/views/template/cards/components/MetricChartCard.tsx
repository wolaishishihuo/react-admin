import { useMemo } from 'react';

import ECharts from '@/components/Echarts';
import { buildSparkBarOption, buildSparkLineOption } from '@/components/Echarts/charts/options';
import useChartTheme from '@/components/Echarts/useChartTheme';

import PercentText from './PercentText';

interface MetricChartCardProps {
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
  const empty = !data.length || data.every(item => item === 0);
  const option = useMemo(
    () =>
      chart === 'line' ? buildSparkLineOption(theme, data, showArea, color) : buildSparkBarOption(theme, data, barWidth, color),
    [theme, data, chart, showArea, barWidth, color]
  );
  const plotHeight = mini ? '60px' : `calc(${height}rem - 5rem)`;

  return (
    <div className='card relative overflow-hidden' style={{ height: `${height}rem` }}>
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-2xl leading-none font-medium m-0'>{value.toLocaleString()}</p>
          <p className='text-sm text-content-pale m-0 mt-1'>{label}</p>
        </div>
        <PercentText value={percentage} className={mini ? 'absolute bottom-6 left-6 text-sm' : 'text-sm'} />
      </div>
      {date ? <div className='text-xs text-content-pale bottom-6 right-6 absolute'>{date}</div> : null}
      <div className={mini ? 'absolute top-5 right-5 w-2/5' : 'absolute right-0 bottom-0 left-0'} style={{ height: plotHeight }}>
        {empty ? null : <ECharts option={option} />}
      </div>
    </div>
  );
};

export default MetricChartCard;
