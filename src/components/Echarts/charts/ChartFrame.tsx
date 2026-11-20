import './index.css';
import ECharts, { type EChartProps } from '@/components/Echarts';

interface ChartFrameProps extends EChartProps {
  empty?: boolean;
  error?: boolean;
  loading?: boolean;
}

const ChartFrame = (props: ChartFrameProps) => {
  const { option, height = '16rem', width = '100%', empty = false, error = false, loading = false, ...chartProps } = props;

  return (
    <div className='chart-frame relative' style={{ height, width }} aria-busy={loading}>
      {error ? (
        <div role='alert' className='chart-empty text-xs flex items-center inset-0 justify-center absolute'>
          图表加载失败
        </div>
      ) : empty ? (
        <div role='status' className='chart-empty text-xs flex items-center inset-0 justify-center absolute'>
          暂无数据
        </div>
      ) : (
        <ECharts {...chartProps} option={option} />
      )}
      {loading ? (
        <div role='status' aria-label='图表加载中' className='chart-loading flex items-center inset-0 justify-center absolute'>
          <svg viewBox='25 25 50 50' className='chart-spinner' aria-hidden='true'>
            <circle cx='50' cy='50' r='20' fill='none' />
          </svg>
        </div>
      ) : null}
    </div>
  );
};

export default ChartFrame;
