import clsx from 'clsx';
import type { ReactNode } from 'react';
import CountUp from 'react-countup';

export type StatCardAccent = 'primary' | 'success' | 'warning' | 'danger';

export interface StatCardItem {
  key: string;
  label: string;
  /** number 走数字滚动动画，其余原样渲染 */
  value: number | ReactNode;
  /** value 为 number 时的小数位，默认 0 */
  decimals?: number;
  /** 数值右侧单位 */
  suffix?: string;
  icon?: ReactNode;
  /** 图标芯片着色，默认 primary */
  accent?: StatCardAccent;
  /** 主数值着色类，默认 text-content */
  valueClass?: string;
  /** 数值下方附加行（提示/链接） */
  extra?: ReactNode;
}

interface StatCardGridProps {
  items: StatCardItem[];
  /** 大屏每行卡数，默认 4 */
  columns?: 3 | 4 | 5;
}

// UnoCSS 静态提取要求完整字面量类名
const GRID_CLASS: Record<3 | 4 | 5, string> = {
  3: 'gap-12px grid grid-cols-3 lt-lg:grid-cols-2 lt-sm:grid-cols-1',
  4: 'gap-12px grid grid-cols-4 lt-lg:grid-cols-2 lt-sm:grid-cols-1',
  5: 'gap-12px grid grid-cols-5 lt-lg:grid-cols-2 lt-sm:grid-cols-1'
};

const CHIP_CLASS: Record<StatCardAccent, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger'
};

/** items 驱动统计卡组；数字滚动/图标芯片/hover 上浮视觉参照 art-design-pro ArtStatsCard，CountUp 0→真值即加载反馈 */
const StatCardGrid = ({ items, columns = 4 }: StatCardGridProps) => (
  <div className={GRID_CLASS[columns]}>
    {items.map(card => {
      const body = (
        <>
          <span className='text-13px text-content-secondary'>{card.label}</span>
          <span className={clsx('text-24px leading-none font-600', card.valueClass ?? 'text-content')}>
            {typeof card.value === 'number' ? (
              <CountUp duration={1} decimals={card.decimals ?? 0} end={card.value} separator=',' />
            ) : (
              card.value
            )}
            {card.suffix && <span className='text-13px text-content-tertiary font-400 ml-4px'>{card.suffix}</span>}
          </span>
          {card.extra}
        </>
      );

      if (!card.icon) {
        return (
          <div
            key={card.key}
            className='app-card p-20px flex flex-col gap-8px transition-transform duration-200 hover:-translate-y-2px'
          >
            {body}
          </div>
        );
      }

      return (
        <div
          key={card.key}
          className='app-card p-20px flex gap-12px transition-transform duration-200 items-center justify-between hover:-translate-y-2px'
        >
          <div className='flex flex-col gap-8px'>{body}</div>
          <span className={clsx('text-20px rd-lg flex-center shrink-0 h-44px w-44px', CHIP_CLASS[card.accent ?? 'primary'])}>
            {card.icon}
          </span>
        </div>
      );
    })}
  </div>
);

export default StatCardGrid;
