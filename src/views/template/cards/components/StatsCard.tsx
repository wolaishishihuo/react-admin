import type { CSSProperties } from 'react';

import CountUp from '@/components/CountUp';
import { Icon } from '@/components/Icon';

interface StatsCardProps {
  icon?: string;
  /** 图标色块。默认主色底白字 */
  iconClassName?: string;
  title?: string;
  count?: number;
  decimals?: number;
  separator?: string;
  description?: string;
  textColor?: string;
  showArrow?: boolean;
  /** 盖住 card 背景，用来做浅色强调底 */
  boxStyle?: CSSProperties;
}

const StatsCard = (props: StatsCardProps) => {
  const {
    icon,
    iconClassName = 'bg-primary text-white',
    title,
    count,
    decimals = 0,
    separator = ',',
    description,
    textColor,
    showArrow = false,
    boxStyle
  } = props;

  return (
    <div className='card flex h-32 transition-transform duration-200 items-center hover:-translate-y-0.5' style={boxStyle}>
      {icon ? (
        <div className={`text-xl mr-4 rounded-lg flex size-11 items-center justify-center ${iconClassName}`}>
          <Icon icon={icon} />
        </div>
      ) : null}
      <div className='flex-1 min-w-0'>
        {title ? (
          <p className='text-lg font-medium m-0' style={{ color: textColor }}>
            {title}
          </p>
        ) : null}
        {count !== undefined ? (
          <CountUp className='text-2xl font-medium m-0' end={count} duration={2} decimals={decimals} separator={separator} />
        ) : null}
        {description ? (
          <p className='text-sm text-content-pale m-0 mt-1' style={{ color: textColor }}>
            {description}
          </p>
        ) : null}
      </div>
      {showArrow ? <Icon icon='ri:arrow-right-s-line' className='text-xl text-content-pale' /> : null}
    </div>
  );
};

export default StatsCard;
