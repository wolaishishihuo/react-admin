import ECharts from '@/components/Echarts';
import type { ECOption } from '@/components/Echarts/config';

interface ChartFrameProps {
  option: ECOption;
  height?: string;
  empty?: boolean;
}

const ChartFrame = (props: ChartFrameProps) => {
  const { option, height = '16rem', empty = false } = props;

  return (
    <div className='w-full relative' style={{ height }}>
      {empty ? (
        <div className='text-xs text-content-pale flex items-center inset-0 justify-center absolute'>暂无数据</div>
      ) : (
        <ECharts option={option} />
      )}
    </div>
  );
};

export default ChartFrame;
