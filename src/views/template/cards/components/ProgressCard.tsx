import { Progress } from 'antd';

import CountUp from '@/components/CountUp';
import { Icon } from '@/components/Icon';

interface ProgressCardProps {
  percentage: number;
  title: string;
  /** 进度条颜色。默认成功色，可传主题色或任意 CSS 颜色 */
  color?: string;
  icon?: string;
  iconClassName?: string;
}

const ProgressCard = (props: ProgressCardProps) => {
  const { percentage, title, color = 'var(--hooks-colorSuccess)', icon, iconClassName } = props;

  return (
    <div className='card flex flex-col h-32 justify-center'>
      <div className={`mb-3.5 flex items-center ${icon ? 'justify-between' : ''}`}>
        {icon ? (
          <div className={`text-2xl rounded-lg flex size-11 items-center justify-center ${iconClassName ?? ''}`}>
            <Icon icon={icon} />
          </div>
        ) : null}
        <div className={icon ? 'text-right' : ''}>
          <CountUp className='text-2xl font-semibold mb-1 block' end={percentage} duration={2} suffix='%' />
          <p className='text-sm text-content-pale m-0'>{title}</p>
        </div>
      </div>
      <Progress
        percent={percentage}
        showInfo={false}
        strokeColor={color}
        railColor='var(--hooks-colorFillSecondary)'
        size={['100%', 5]}
      />
    </div>
  );
};

export default ProgressCard;
