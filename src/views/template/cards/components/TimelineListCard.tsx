import { Timeline } from 'antd';

export interface TimelineListItem {
  id: string;
  time: string;
  color: string;
  content: string;
  code?: string;
}

interface TimelineListCardProps {
  title: string;
  subtitle?: string;
  list: TimelineListItem[];
  maxCount?: number;
}

const ITEM_HEIGHT = 72;

const TimelineListCard = (props: TimelineListCardProps) => {
  const { title, subtitle, list, maxCount = 5 } = props;
  const visible = list.slice(0, maxCount);

  return (
    <div className='card'>
      <div className='pb-3.5'>
        <p className='text-lg font-medium m-0'>{title}</p>
        {subtitle ? <p className='text-sm text-content-pale m-0'>{subtitle}</p> : null}
      </div>
      <div className='overflow-auto' style={{ maxHeight: ITEM_HEIGHT * maxCount }}>
        <Timeline
          items={visible.map(item => ({
            key: item.id,
            color: item.color,
            title: item.time,
            content: (
              <span className='text-sm'>
                {item.content}
                {item.code ? <span className='text-primary ml-2'>#{item.code}</span> : null}
              </span>
            )
          }))}
        />
      </div>
    </div>
  );
};

export default TimelineListCard;
