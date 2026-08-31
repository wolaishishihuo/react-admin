import './index.less';

import { Menu, MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { MetaProps, RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore } from '@/stores';
import { getOpenKeys } from '@/utils';

interface LayoutMenuProps {
  mode: MenuProps['mode'];
  menuList?: RouteObjectType[];
  menuSplit?: boolean;
}

const LayoutMenu: React.FC<LayoutMenuProps> = ({ mode, menuList, menuSplit }) => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { layout, isDark, accordion, isCollapse, siderInverted, headerInverted } = useGlobalStore(state => ({
    layout: state.layout,
    isDark: state.isDark,
    accordion: state.accordion,
    isCollapse: state.isCollapse,
    siderInverted: state.siderInverted,
    headerInverted: state.headerInverted
  }));
  const showMenuList = useAuthStore(state => state.showMenuList);
  const flatMenuList = useAuthStore(state => state.flatMenuList);

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [splitSelectedKeys, setSplitSelectedKeys] = useState<string[]>([]);

  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type
    } as MenuItem;
  }

  function renderMenuIcon(name?: string) {
    if (!name) return undefined;
    return (
      <span className='menu-icon'>
        <Icon icon={name} />
      </span>
    );
  }

  const handleMenuAsAntdFormat = (list: RouteObjectType[]): MenuItem[] => {
    return list.map(item => {
      return !item?.children?.length
        ? getItem(item.meta?.title, item.path, renderMenuIcon(item.meta?.icon))
        : getItem(item.meta?.title, item.path, renderMenuIcon(item.meta?.icon), handleMenuAsAntdFormat(item.children!));
    });
  };

  const antdMenuList = useMemo(() => handleMenuAsAntdFormat(menuList ?? showMenuList), [menuList, showMenuList]);

  useEffect(() => {
    const meta = matches[matches.length - 1].data as MetaProps;
    // Set Selected Keys
    const path = meta?.activeMenu ?? pathname;
    setSelectedKeys([path]);

    // Set Split Selected Keys (find can be found to represent children)
    const splitPath = `/${path.split('/')[1]}`;
    const splitKeys = showMenuList.find(item => item.path === splitPath) ? splitPath : path;
    setSplitSelectedKeys([splitKeys]);

    // Use setTimeout to prevent style exceptions from menu expansion
    if (accordion) setTimeout(() => isCollapse || setOpenKeys(getOpenKeys(pathname)));
  }, [matches, isCollapse]);

  const onOpenChange: MenuProps['onOpenChange'] = openKeys => {
    if (openKeys.length === 0 || openKeys.length === 1) return setOpenKeys(openKeys);
    const latestOpenKey = openKeys[openKeys.length - 1];
    if (latestOpenKey.includes(openKeys[0])) return setOpenKeys(openKeys);
    setOpenKeys([latestOpenKey]);
  };

  const handleMenuNavigation = (path: string) => {
    const menuItem = flatMenuList.find(item => item.path === path);
    if (menuItem?.meta?.isLink) window.open(menuItem.meta.isLink, '_blank');
    navigate(path);
  };

  const clickMenu: MenuProps['onClick'] = ({ key }) => {
    // If not split menu
    if (!menuSplit) return handleMenuNavigation(key);

    // If split menu
    const children = showMenuList.find(item => item.path === key)?.children;
    if (children?.length) return handleMenuNavigation(children[0].path!);
    handleMenuNavigation(key);
  };

  const isClassicLayout = useMemo(() => layout === 'classic', [layout]);
  const isTransverseLayout = useMemo(() => layout === 'transverse', [layout]);

  const isDarkTheme = useMemo(() => {
    if (isDark) return true;
    if (headerInverted && isTransverseLayout) return true;
    if (headerInverted && isClassicLayout && menuSplit) return true;
    if (siderInverted && !isTransverseLayout && !menuSplit) return true;
    return false;
  }, [layout, isDark, headerInverted, siderInverted, menuSplit]);

  return (
    <Menu
      theme={isDarkTheme ? 'dark' : 'light'}
      mode={mode}
      selectedKeys={menuSplit ? splitSelectedKeys : selectedKeys}
      onClick={clickMenu}
      items={antdMenuList}
      {...(!isTransverseLayout && accordion && { openKeys, onOpenChange })}
    />
  );
};

export default LayoutMenu;
