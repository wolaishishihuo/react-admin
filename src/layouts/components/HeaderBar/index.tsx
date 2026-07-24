import clsx from 'clsx';
import type React from 'react';
import logo from '@/assets/images/logo.svg';
import useIsMobile from '@/hooks/useIsMobile';
import LayoutMenu from '@/layouts/components/Menu';
import MixedMenu from '@/layouts/components/MixedMenu';
import { useGlobalStore } from '@/stores';
import AvatarIcon from './components/AvatarIcon';
import BreadcrumbNav from './components/BreadcrumbNav';
import CollapseIcon from './components/CollapseIcon';
import DarkModeToggle from './components/DarkModeToggle';
import Fullscreen from './components/Fullscreen';
import RefreshButton from './components/RefreshButton';
import SearchMenu from './components/SearchMenu';
import ThemeSetting from './components/ThemeSetting';
import './index.less';

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

/** 头部区块按布局模式显隐 */
const HeaderBar: React.FC = () => {
  const menuType = useGlobalStore(state => state.menuType);
  const isMobile = useIsMobile();

  const showLogo = !isMobile && menuType === 'top';
  const showHamburger = isMobile || menuType === 'left';
  const showBreadcrumb = menuType === 'left' || menuType === 'dual-menu';

  return (
    <div className='header-bar'>
      {/* mask-image 仅面包屑场景需要（右缘渐隐裁溢出）；水平/混合菜单自带溢出收纳，加了会把菜单右缘也淡出 */}
      <div
        className={clsx('flex flex-1 gap-4px min-w-0 items-center overflow-hidden', showBreadcrumb && 'tool-bar-lf mask-image')}
      >
        {showLogo && (
          <div className='header-logo'>
            <img src={logo} alt='logo' className='logo-img' />
            <h2 className='logo-text'>{APP_TITLE}</h2>
          </div>
        )}
        {showHamburger && <CollapseIcon />}
        <RefreshButton />
        {showBreadcrumb && <BreadcrumbNav />}
        {!isMobile && menuType === 'top' && <LayoutMenu mode='horizontal' />}
        {!isMobile && menuType === 'top-left' && <MixedMenu />}
      </div>
      <div className='flex shrink-0 gap-10px h-60px items-center'>
        <SearchMenu />
        <Fullscreen />
        <ThemeSetting />
        <DarkModeToggle />
        <AvatarIcon />
      </div>
    </div>
  );
};

export default HeaderBar;
