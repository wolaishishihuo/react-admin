import type { MenuProps } from 'antd';

import { Icon } from '@/components/Icon';

type TabMenuHandlers = {
  currentPath: string;
  refresh: () => void;
  maximize: () => void;
  closeCurrent: (path: string) => void;
  closeLeft: (path: string) => void;
  closeRight: (path: string) => void;
  closeOther: (path: string) => void;
  closeAll: () => void;
};

export const buildTabMenuItems = (targetPath: string, handlers: TabMenuHandlers): MenuProps['items'] => {
  const isCurrent = targetPath === handlers.currentPath;

  return [
    {
      key: 'refresh',
      label: <span>刷新</span>,
      icon: <Icon className='text-14px' icon='ri:refresh-line' />,
      disabled: !isCurrent,
      onClick: handlers.refresh
    },
    {
      key: 'maximize',
      label: <span>最大化</span>,
      icon: <Icon className='text-14px' icon='ri:fullscreen-line' />,
      onClick: handlers.maximize
    },
    { type: 'divider' },
    {
      key: 'closeCurrent',
      label: <span>关闭当前</span>,
      icon: <Icon className='text-14px' icon='ri:close-circle-line' />,
      onClick: () => handlers.closeCurrent(targetPath)
    },
    {
      key: 'closeLeft',
      label: <span>关闭左侧</span>,
      icon: <Icon className='text-14px' icon='ri:arrow-left-s-line' />,
      onClick: () => handlers.closeLeft(targetPath)
    },
    {
      key: 'closeRight',
      label: <span>关闭右侧</span>,
      icon: <Icon className='text-14px' icon='ri:arrow-right-s-line' />,
      onClick: () => handlers.closeRight(targetPath)
    },
    { type: 'divider' },
    {
      key: 'closeOther',
      label: <span>关闭其它</span>,
      icon: <Icon className='text-14px' icon='ri:close-fill' />,
      onClick: () => handlers.closeOther(targetPath)
    },
    {
      key: 'closeAll',
      label: <span>关闭所有</span>,
      icon: <Icon className='text-14px' icon='ri:close-circle-line' />,
      onClick: handlers.closeAll
    }
  ];
};
