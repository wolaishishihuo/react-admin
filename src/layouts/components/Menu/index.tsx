import './index.css';
import { Menu, type MenuProps } from 'antd';
import { type Key, type ReactNode, useEffect, useMemo, useState } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import { Icon } from '@/components/Icon';
import type { MetaProps, RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore } from '@/stores';
import { findMenuBranch } from '@/utils';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(label: ReactNode, key?: Key | null, icon?: ReactNode, children?: MenuItem[], type?: 'group'): MenuItem {
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

function handleMenuAsAntdFormat(list: RouteObjectType[]): MenuItem[] {
  return list.map(item =>
    !item?.children?.length
      ? getItem(item.meta?.title, item.path, renderMenuIcon(item.meta?.icon))
      : getItem(item.meta?.title, item.path, renderMenuIcon(item.meta?.icon), handleMenuAsAntdFormat(item.children))
  );
}

interface LayoutMenuProps {
  /** 菜单排版方向 */
  mode: MenuProps['mode'];
  /** 自定义菜单列表（分栏模式传入子菜单） */
  menuList?: RouteObjectType[];
  /** 是否在顶部栏展示分割菜单 */
  menuSplit?: boolean;
}

const LayoutMenu = (props: LayoutMenuProps) => {
  const { mode, menuList, menuSplit } = props;
  const matches = useMatches();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { layout, isDark, accordion, isCollapse, siderInverted, headerInverted } = useGlobalStore(
    useShallow(state => ({
      layout: state.layout,
      isDark: state.isDark,
      accordion: state.accordion,
      isCollapse: state.isCollapse,
      siderInverted: state.siderInverted,
      headerInverted: state.headerInverted
    }))
  );
  const { authMenuList, showMenuList, flatMenuList } = useAuthStore(
    useShallow(state => ({
      authMenuList: state.authMenuList,
      showMenuList: state.showMenuList,
      flatMenuList: state.flatMenuList
    }))
  );

  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 稳定 antd Menu items 引用，避免展开/折叠子菜单时重建整棵菜单配置
  const antdMenuList = useMemo(() => handleMenuAsAntdFormat(menuList ?? showMenuList), [menuList, showMenuList]);

  const meta = matches[matches.length - 1]?.data as MetaProps | undefined;
  const activePath = meta?.activeMenu ?? pathname;
  const splitKey = findMenuBranch(authMenuList, activePath)[0]?.path ?? activePath;
  const selectedKeys = [menuSplit ? splitKey : activePath];

  const isClassicLayout = layout === 'classic';
  const isTransverseLayout = layout === 'transverse';
  const isDarkTheme =
    isDark ||
    (headerInverted && isTransverseLayout) ||
    (headerInverted && isClassicLayout && Boolean(menuSplit)) ||
    (siderInverted && !isTransverseLayout && !menuSplit);

  function onOpenChange(nextOpenKeys: string[]) {
    if (nextOpenKeys.length <= 1) return setOpenKeys(nextOpenKeys);
    const latestOpenKey = nextOpenKeys[nextOpenKeys.length - 1];
    const branchKeys = findMenuBranch(menuList ?? showMenuList, latestOpenKey)
      .map(item => item.path)
      .filter((key): key is string => Boolean(key));
    setOpenKeys(branchKeys.length ? branchKeys : [latestOpenKey]);
  }

  function handleMenuNavigation(path: string) {
    const menuItem = flatMenuList.find(item => item.path === path);
    if (menuItem?.meta?.isLink) {
      window.open(menuItem.meta.isLink, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(path);
  }

  function clickMenu({ key }: { key: string }) {
    if (!menuSplit) return handleMenuNavigation(key);

    const children = showMenuList.find(item => item.path === key)?.children;
    if (children?.length) return handleMenuNavigation(children[0].path!);
    handleMenuNavigation(key);
  }

  useEffect(() => {
    // Use setTimeout to prevent style exceptions from menu expansion
    if (!accordion || isCollapse || mode === 'horizontal') return;
    const source = menuList ?? showMenuList;
    const branch = findMenuBranch(source, activePath);
    const resolvedBranch = branch.length || menuList ? branch : findMenuBranch(authMenuList, activePath);
    const nextOpenKeys = resolvedBranch
      .slice(0, -1)
      .map(item => item.path)
      .filter((key): key is string => Boolean(key));
    const timer = window.setTimeout(() => setOpenKeys(nextOpenKeys));
    return () => window.clearTimeout(timer);
  }, [accordion, isCollapse, mode, activePath, menuList, showMenuList, authMenuList]);

  return (
    <Menu
      theme={isDarkTheme ? 'dark' : 'light'}
      mode={mode}
      selectedKeys={selectedKeys}
      onClick={clickMenu}
      items={antdMenuList}
      {...(!isTransverseLayout && accordion && { openKeys, onOpenChange })}
    />
  );
};

export default LayoutMenu;
