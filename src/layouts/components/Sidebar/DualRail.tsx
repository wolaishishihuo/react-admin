import { Tooltip } from 'antd';
import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon as SvgIcon } from '@iconify/react/offline';
import logo from '@/assets/images/logo.svg';
import { Icon } from '@/components/Icon';
import useIsMobile from '@/hooks/useIsMobile';
import { type RouteObjectType } from '@/routers/interface';
import { setGlobalState, useGlobalStore, useAuthStore } from '@/stores';
import { getRootMenuPath } from '@/utils';

interface DualRailProps {
  /** 菜单主题 CSS 变量（rail 与第二列分别注入） */
  style?: React.CSSProperties;
}

/** dual-menu 一级图标轨道列 */
const DualRail: React.FC<DualRailProps> = ({ style }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dualMenuShowText = useGlobalStore(state => state.dualMenuShowText);
  const showMenuList = useAuthStore(state => state.showMenuList);
  const isMobile = useIsMobile();

  const rootPath = getRootMenuPath(showMenuList, pathname);

  const handleNavigation = (item: RouteObjectType) => {
    if (item.meta?.isLink) window.open(item.meta.isLink, '_blank');
    navigate(item.path!);
  };

  const changeSubMenu = (item: RouteObjectType) => {
    handleNavigation(item.children?.length ? item.children[0] : item);
    // 移动端叶子项导航后收起抽屉
    if (isMobile && !item.children?.length) setGlobalState({ key: 'isCollapse', value: true });
  };

  return (
    <div className={`dual-rail ${dualMenuShowText ? '' : 'icon-only'}`} style={style}>
      <div className='rail-logo'>
        <img src={logo} alt='logo' className='logo-img' />
      </div>
      <div className='menu-list'>
        {showMenuList.map(item => (
          <Tooltip key={item.path} placement='right' title={dualMenuShowText ? '' : item.meta?.title}>
            <div
              className={`menu-item ${(pathname === item.path || rootPath === item.path) && 'menu-active'}`}
              onClick={() => changeSubMenu(item)}
            >
              <Icon name={item.meta!.icon!} />
              {dualMenuShowText && <span className='title truncate'>{item.meta?.title}</span>}
            </div>
          </Tooltip>
        ))}
      </div>
      {/* 第一列底部图标/文字形态切换钮 */}
      <div className='rail-switch' onClick={() => setGlobalState({ key: 'dualMenuShowText', value: !dualMenuShowText })}>
        <SvgIcon icon='ri:arrow-left-right-fill' />
      </div>
    </div>
  );
};

export default DualRail;
