import './index.less';

import { Icon as SvgIcon } from '@iconify/react/offline';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import logo from '@/assets/images/logo.svg';
import useIsMobile from '@/hooks/useIsMobile';
import LayoutMenu from '@/layouts/components/Menu';
import { useAuthStore, useGlobalStore } from '@/stores';
import { getRootMenuPath } from '@/utils';

import DualRail from './DualRail';
import { getMenuTheme } from './theme';

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const Sidebar: React.FC = () => {
  const isCollapse = useGlobalStore(state => state.isCollapse);
  const menuOpenWidth = useGlobalStore(state => state.menuOpenWidth);
  const menuThemeType = useGlobalStore(state => state.menuThemeType);
  const isDark = useGlobalStore(state => state.isDark);
  const menuType = useGlobalStore(state => state.menuType);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);
  const showMenuList = useAuthStore(state => state.showMenuList);
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  // 当前一级子菜单（菜单树顶层祖先）
  const subMenuList = useMemo(() => {
    const rootPath = getRootMenuPath(showMenuList, pathname);
    const menuItem = showMenuList.find(item => item.path === rootPath);
    return menuItem?.children ?? [];
  }, [pathname, showMenuList]);

  const isDual = menuType === 'dual-menu';
  // 分栏模式侧栏仅展示当前一级子菜单
  const splitMode = menuType === 'top-left' ? !isMobile : isDual;
  const hidden = splitMode && !subMenuList.length;

  const menuTheme = getMenuTheme(menuThemeType, isDark);
  // dark 档弹出子菜单换肤类名
  const popupClassName = !isDark && menuThemeType === 'dark' ? 'menu-popup-dark' : undefined;

  const themeVars = {
    '--menu-open-width': `${menuOpenWidth}px`,
    '--menu-bg': menuTheme.background,
    '--menu-text': menuTheme.textColor,
    '--menu-icon': menuTheme.iconColor,
    '--menu-name': menuTheme.systemNameColor
  } as React.CSSProperties;

  return (
    <React.Fragment>
      {isDual && <DualRail style={themeVars} />}
      <div
        className={clsx(
          'sidebar',
          `menu-theme-${menuTheme.theme}`,
          isCollapse && 'sidebar-collapsed',
          hidden && 'sidebar-hidden',
          isDual && 'sidebar-dual'
        )}
        style={themeVars}
      >
        {isDual ? (
          // dual 第二列系统名头（logo 仅在 rail）
          <div className='sidebar-header'>{!isCollapse && <span className='logo-text'>{APP_TITLE}</span>}</div>
        ) : (
          <div className='sidebar-header'>
            <img src={logo} alt='logo' className='logo-img' />
            {!isCollapse && <h2 className='logo-text'>{APP_TITLE}</h2>}
          </div>
        )}
        <LayoutMenu mode='inline' menuList={splitMode ? subMenuList : undefined} popupClassName={popupClassName} />
      </div>
      {/* dual 第二列右缘 11×50 悬浮折叠钮（aside 悬停浮现） */}
      {isDual && !!subMenuList.length && (
        <div className='dual-collapse-btn' onClick={() => setGlobalState('isCollapse', !isCollapse)}>
          <SvgIcon icon={isCollapse ? 'ri:arrow-right-wide-fill' : 'ri:arrow-left-wide-fill'} />
        </div>
      )}
    </React.Fragment>
  );
};

export default Sidebar;
