import { useMemo } from 'react';

import ECharts from '@/components/Echarts';
import { buildMiniDonutOption } from '@/components/Echarts/charts/options';
import useChartTheme from '@/components/Echarts/useChartTheme';

import PercentText from './PercentText';

const DEFAULT_RADIUS: [string, string] = ['70%', '90%'];

interface DonutChartCardProps {
  value: number;
  title: string;
  percentage: number;
  percentageLabel?: string;
  currentValue?: string;
  previousValue?: string;
  data: [number, number];
  height?: number;
  radius?: [string, string];
  /** 不传则用主题色 light-1 */
  color?: string;
}

const DonutChartCard = (props: DonutChartCardProps) => {
  const {
    value,
    title,
    percentage,
    percentageLabel,
    currentValue,
    previousValue,
    data,
    height = 9,
    radius = DEFAULT_RADIUS,
    color
  } = props;
  const theme = useChartTheme();
  const empty = data.every(item => item === 0);
  const option = useMemo(() => buildMiniDonutOption(theme, data, radius, color), [theme, data, radius, color]);

  return (
    <div className='card overflow-hidden' style={{ height: `${height}rem` }}>
      <div className='flex gap-5 h-full items-start'>
        <div className='flex flex-1 flex-col h-full justify-between'>
          <p className='text-xl leading-tight font-medium m-0'>{title}</p>
          <div>
            <p className='text-xl leading-tight font-medium m-0'>{value.toLocaleString()}</p>
            <div className='mt-1.5'>
              <PercentText value={percentage} className='text-xs' suffix={percentageLabel ? ` ${percentageLabel}` : ''} />
            </div>
          </div>
          <div className='text-xs text-content-pale mt-2 flex gap-4'>
            {currentValue ? (
              <div className='flex items-center'>
                <span className='mr-2 rounded-full size-2' style={{ background: color || 'var(--hooks-colorPrimary1)' }} />
                {currentValue}
              </div>
            ) : null}
            {previousValue ? (
              <div className='flex items-center'>
                <span className='mr-2 rounded-full bg-[var(--hooks-colorBorderBox)] size-2' />
                {previousValue}
              </div>
            ) : null}
          </div>
        </div>
        <div className='flex-1 h-[7.5rem] max-w-40'>{empty ? null : <ECharts option={option} />}</div>
      </div>
    </div>
  );
};

export default DonutChartCard;
