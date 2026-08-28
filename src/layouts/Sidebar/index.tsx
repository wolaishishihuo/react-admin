import clsx from 'clsx';
import { useMemo } from 'react';
import { Icon as SvgIcon } from '@iconify/react/offline';
import logo from '@/assets/images/logo.svg';
import useIsMobile from '@/hooks/useIsMobile';
import { useAuthorizedNavigation, useMenuSelectPath } from '@/features/navigation/menu-model';
import { getRootMenuPath } from '@/features/navigation/menu-tree';
import { patchAdminLayout, useAdminLayoutStore } from '@/stores/modules/admin-layout.store';
import { selectIsDark, useThemeStore } from '@/stores/modules/theme.store';
import LayoutMenu from '../Menu';
import DualRail from './DualRail';
import { getMenuTheme } from './theme';
import './index.less';

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

export default function Sidebar() {
  const isCollapse = useAdminLayoutStore(state => state.isCollapse);
  const menuOpenWidth = useAdminLayoutStore(state => state.menuOpenWidth);
  const menuThemeType = useAdminLayoutStore(state => state.menuThemeType);
  const menuType = useAdminLayoutStore(state => state.menuType);
  const isDark = useThemeStore(selectIsDark);
  const { tree, visibleTree } = useAuthorizedNavigation();
  const selectedPath = useMenuSelectPath();
  const isMobile = useIsMobile();

  const subMenuList = useMemo(() => {
    const rootPath = getRootMenuPath(tree, selectedPath);
    const menuItem = visibleTree.find(item => item.path === rootPath);
    return menuItem?.children ?? [];
  }, [selectedPath, tree, visibleTree]);

  const isDual = menuType === 'dual-menu';
  const splitMode = menuType === 'top-left' ? !isMobile : isDual;
  const hidden = splitMode && !subMenuList.length;
  const menuTheme = getMenuTheme(menuThemeType, isDark);
  const popupClassName = !isDark && menuThemeType === 'dark' ? 'menu-popup-dark' : undefined;
  const themeVars = {
    '--menu-open-width': `${menuOpenWidth}px`,
    '--menu-bg': menuTheme.background,
    '--menu-text': menuTheme.textColor,
    '--menu-icon': menuTheme.iconColor,
    '--menu-name': menuTheme.systemNameColor
  } as React.CSSProperties;

  return (
    <>
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
          <div className='sidebar-header'>{!isCollapse && <span className='logo-text'>{APP_TITLE}</span>}</div>
        ) : (
          <div className='sidebar-header'>
            <img src={logo} alt='logo' className='logo-img' />
            {!isCollapse && <h2 className='logo-text'>{APP_TITLE}</h2>}
          </div>
        )}
        <LayoutMenu mode='inline' menuList={splitMode ? subMenuList : undefined} popupClassName={popupClassName} />
      </div>
      {isDual && !!subMenuList.length && (
        <div className='dual-collapse-btn' onClick={() => patchAdminLayout({ isCollapse: !isCollapse })}>
          <SvgIcon icon={isCollapse ? 'ri:arrow-right-wide-fill' : 'ri:arrow-left-wide-fill'} />
        </div>
      )}
    </>
  );
}
