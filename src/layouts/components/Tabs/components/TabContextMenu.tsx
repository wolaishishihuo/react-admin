import { Icon as SvgIcon } from '@iconify/react/offline';
import { Dropdown, type DropdownProps, type MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HOME_URL } from '@/config';
import { closeMultipleTab, closeTabsOnSide, setGlobalState, useTabsStore } from '@/stores';
import { refreshKeepAlive } from '@/utils/keepAlive';

interface TabContextMenuProps {
  /** 菜单作用目标标签路径 */
  path: string;
  /** 当前激活标签路径 */
  activePath: string;
  /** 触发方式，默认右键 */
  trigger?: DropdownProps['trigger'];
  placement?: DropdownProps['placement'];
  children: React.ReactElement;
}

/** 标签栏右键/more 双入口菜单：刷新、最大化、批量关闭 */
const TabContextMenu: React.FC<TabContextMenuProps> = ({ path, activePath, trigger = ['contextMenu'], placement, children }) => {
  const navigate = useNavigate();
  const tabsList = useTabsStore(state => state.tabsList);

  const clickedIndex = tabsList.findIndex(item => item.path === path);
  const activeIndex = tabsList.findIndex(item => item.path === activePath);
  const isCurrentTab = path === activePath;
  const isLastTab = clickedIndex === tabsList.length - 1;
  const isOneTab = tabsList.length === 1;

  const allUnclosable = (tabs: typeof tabsList) => tabs.length > 0 && tabs.every(item => !item.closable);
  const allLeftUnclosable = allUnclosable(tabsList.slice(0, clickedIndex));
  const allRightUnclosable = allUnclosable(tabsList.slice(clickedIndex + 1));
  const allOthersUnclosable = allUnclosable(tabsList.filter((_, index) => index !== clickedIndex));
  const allTabsUnclosable = tabsList.every(item => !item.closable);

  const closeSide = (type: 'left' | 'right') => {
    const activeInRange = type === 'left' ? activeIndex < clickedIndex : activeIndex > clickedIndex;
    if (activeInRange) navigate(path);
    closeTabsOnSide({ path, type });
  };

  const items: MenuProps['items'] = [
    {
      key: 'refresh',
      label: <span>刷新</span>,
      icon: <SvgIcon icon='ri:refresh-line' className='text-14px!' />,
      disabled: !isCurrentTab,
      onClick: () => refreshKeepAlive(path)
    },
    {
      key: 'maximize',
      label: <span>最大化</span>,
      icon: <SvgIcon icon='ri:fullscreen-line' className='text-14px!' />,
      onClick: () => setGlobalState({ key: 'maximize', value: true })
    },
    {
      type: 'divider'
    },
    {
      key: 'left',
      label: <span>关闭左侧</span>,
      icon: <SvgIcon icon='ri:arrow-left-s-line' className='text-14px!' />,
      disabled: clickedIndex === 0 || allLeftUnclosable,
      onClick: () => closeSide('left')
    },
    {
      key: 'right',
      label: <span>关闭右侧</span>,
      icon: <SvgIcon icon='ri:arrow-right-s-line' className='text-14px!' />,
      disabled: isLastTab || allRightUnclosable,
      onClick: () => closeSide('right')
    },
    {
      key: 'other',
      label: <span>关闭其它</span>,
      icon: <SvgIcon icon='ri:close-fill' className='text-14px!' />,
      disabled: isOneTab || allOthersUnclosable,
      onClick: () => {
        if (path !== activePath) navigate(path);
        closeMultipleTab({ path });
      }
    },
    {
      key: 'all',
      label: <span>关闭所有</span>,
      icon: <SvgIcon icon='ri:close-circle-line' className='text-14px!' />,
      disabled: isOneTab || allTabsUnclosable,
      onClick: () => {
        closeMultipleTab({});
        navigate(HOME_URL);
      }
    }
  ];

  return (
    <Dropdown menu={{ items }} trigger={trigger} placement={placement}>
      {children}
    </Dropdown>
  );
};

export default TabContextMenu;
