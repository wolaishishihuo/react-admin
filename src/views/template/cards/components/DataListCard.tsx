import { Button } from 'antd';

import { Icon } from '@/components/Icon';

export interface DataListItem {
  id: string;
  title: string;
  status: string;
  time: string;
  icon: string;
  iconClassName: string;
}

interface DataListCardProps {
  title: string;
  subtitle?: string;
  list: DataListItem[];
  maxCount?: number;
  showMore?: boolean;
  onMore?: () => void;
}

const ITEM_HEIGHT = 66;

const DataListCard = (props: DataListCardProps) => {
  const { title, subtitle, list, maxCount = 5, showMore = false, onMore } = props;
  const visible = list.slice(0, maxCount);

  return (
    <div className='card'>
      <div className='pb-3.5'>
        <p className='text-lg font-medium m-0'>{title}</p>
        {subtitle ? <p className='text-sm text-content-pale m-0'>{subtitle}</p> : null}
      </div>
      <div className='overflow-auto' style={{ maxHeight: ITEM_HEIGHT * maxCount }}>
        {visible.map(item => (
          <div key={item.id} className='py-3 flex items-center'>
            <div className={`mr-3 rounded-lg flex size-10 items-center justify-center ${item.iconClassName}`}>
              <Icon icon={item.icon} className='text-xl' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-sm mb-1'>{item.title}</div>
              <div className='text-xs text-content-pale'>{item.status}</div>
            </div>
            <div className='text-xs text-content-pale ml-3'>{item.time}</div>
          </div>
        ))}
      </div>
      {showMore ? (
        <Button className='mt-6' block onClick={onMore}>
          查看更多
        </Button>
      ) : null}
    </div>
  );
};

export default DataListCard;
