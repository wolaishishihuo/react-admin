import { Tooltip } from 'antd';
import type React from 'react';
import { Icon as SvgIcon } from '@iconify/react/offline';
import logo from '@/assets/images/logo.svg';
import { Icon } from '@/components/Icon';
import useIsMobile from '@/hooks/useIsMobile';
import { useAuthorizedNavigation } from '@/features/navigation/menu-model';
import { getRootMenuPath } from '@/features/navigation/menu-tree';
import type { NavigationItem } from '@/features/navigation/types';
import { getMenuSelectPath, useRoute } from '@/router/use-route';
import { navigateTo } from '@/router/router-ref';
import { patchAdminLayout, useAdminLayoutStore } from '@/stores/modules/admin-layout.store';
import { isHttpUrl, openExternal } from '@/utils/url';

interface DualRailProps {
  /** 菜单主题 CSS 变量（rail 与第二列分别注入） */
  style?: React.CSSProperties;
}

/** dual-menu 一级图标轨道列 */
const DualRail: React.FC<DualRailProps> = ({ style }) => {
  const route = useRoute();
  const dualMenuShowText = useAdminLayoutStore(state => state.dualMenuShowText);
  const { tree, visibleTree } = useAuthorizedNavigation();
  const isMobile = useIsMobile();
  const selectedPath = getMenuSelectPath(route);
  const rootPath = getRootMenuPath(tree, selectedPath);

  const handleNavigation = (item: NavigationItem) => {
    if (item.external && isHttpUrl(item.external)) {
      openExternal(item.external);
      return;
    }
    void navigateTo(item.path);
  };

  const changeSubMenu = (item: NavigationItem) => {
    handleNavigation(item.children[0] ?? item);
    if (isMobile && !item.children.length) patchAdminLayout({ isCollapse: true });
  };

  return (
    <div className={`dual-rail ${dualMenuShowText ? '' : 'icon-only'}`} style={style}>
      <div className='rail-logo'>
        <img src={logo} alt='logo' className='logo-img' />
      </div>
      <div className='menu-list'>
        {visibleTree.map(item => (
          <Tooltip key={item.path} placement='right' title={dualMenuShowText ? '' : item.title}>
            <div
              className={`menu-item ${(selectedPath === item.path || rootPath === item.path) && 'menu-active'}`}
              onClick={() => changeSubMenu(item)}
            >
              <Icon name={item.icon!} />
              {dualMenuShowText && <span className='title truncate'>{item.title}</span>}
            </div>
          </Tooltip>
        ))}
      </div>
      <div className='rail-switch' onClick={() => patchAdminLayout({ dualMenuShowText: !dualMenuShowText })}>
        <SvgIcon icon='ri:arrow-left-right-fill' />
      </div>
    </div>
  );
};

export default DualRail;
