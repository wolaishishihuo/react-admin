import { Icon as SvgIcon } from '@iconify/react/offline';
import { Dropdown, type DropdownProps, type MenuProps } from 'antd';
import { patchAdminLayout } from '@/stores/modules/admin-layout.store';
import {
  bumpContentRevision,
  closeAllTabs,
  closeOtherTabs,
  closeTabsOnSide,
  getVisibleTabs,
  useTabsStore
} from '@/stores/modules/tabs.store';

interface TabContextMenuProps {
  path: string;
  activePath: string;
  trigger?: DropdownProps['trigger'];
  placement?: DropdownProps['placement'];
  children: React.ReactElement;
}

export default function TabContextMenu({
  path,
  activePath,
  trigger = ['contextMenu'],
  placement,
  children
}: TabContextMenuProps) {
  const homeTab = useTabsStore(state => state.homeTab);
  const tabs = useTabsStore(state => state.tabs);
  const tabsList = getVisibleTabs({ homeTab, tabs });

  const clickedIndex = tabsList.findIndex(item => item.id === path);
  const isCurrentTab = path === activePath;
  const isLastTab = clickedIndex === tabsList.length - 1;
  const isOneTab = tabsList.length === 1;

  const allFixed = (items: typeof tabsList) => items.length > 0 && items.every(item => item.fixed);
  const allLeftFixed = allFixed(tabsList.slice(0, clickedIndex));
  const allRightFixed = allFixed(tabsList.slice(clickedIndex + 1));
  const allOthersFixed = allFixed(tabsList.filter((_, index) => index !== clickedIndex));
  const allTabsFixed = tabsList.every(item => item.fixed);

  const items: MenuProps['items'] = [
    {
      key: 'refresh',
      label: <span>刷新</span>,
      icon: <SvgIcon icon='ri:refresh-line' className='text-14px!' />,
      disabled: !isCurrentTab,
      onClick: () => bumpContentRevision(path)
    },
    {
      key: 'maximize',
      label: <span>最大化</span>,
      icon: <SvgIcon icon='ri:fullscreen-line' className='text-14px!' />,
      onClick: () => patchAdminLayout({ maximize: true })
    },
    { type: 'divider' },
    {
      key: 'left',
      label: <span>关闭左侧</span>,
      icon: <SvgIcon icon='ri:arrow-left-s-line' className='text-14px!' />,
      disabled: clickedIndex === 0 || allLeftFixed,
      onClick: () => closeTabsOnSide(path, 'left', activePath)
    },
    {
      key: 'right',
      label: <span>关闭右侧</span>,
      icon: <SvgIcon icon='ri:arrow-right-s-line' className='text-14px!' />,
      disabled: isLastTab || allRightFixed,
      onClick: () => closeTabsOnSide(path, 'right', activePath)
    },
    {
      key: 'other',
      label: <span>关闭其它</span>,
      icon: <SvgIcon icon='ri:close-fill' className='text-14px!' />,
      disabled: isOneTab || allOthersFixed,
      onClick: () => closeOtherTabs(path, activePath)
    },
    {
      key: 'all',
      label: <span>关闭所有</span>,
      icon: <SvgIcon icon='ri:close-circle-line' className='text-14px!' />,
      disabled: isOneTab || allTabsFixed,
      onClick: () => closeAllTabs(activePath)
    }
  ];

  return (
    <Dropdown menu={{ items }} trigger={trigger} placement={placement}>
      {children}
    </Dropdown>
  );
}
