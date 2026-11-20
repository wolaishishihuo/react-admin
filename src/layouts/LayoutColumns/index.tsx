import './index.css';
import { Layout } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

import logo from '@/assets/images/logo.png';
import { Icon } from '@/components/Icon';
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft';
import ToolBarRight from '@/layouts/components/Header/ToolBarRight';
import LayoutMain from '@/layouts/components/Main';
import LayoutMenu from '@/layouts/components/Menu';
import { LAYOUT_SIDER_COLLAPSED_WIDTH, LAYOUT_SIDER_WIDTH } from '@/layouts/constants';
import type { RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore } from '@/stores';

const { Sider } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutColumns = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isCollapse = useGlobalStore(state => state.isCollapse);
  const showMenuList = useAuthStore(state => state.showMenuList);

  const activeMenu = showMenuList.find(item => pathname === item.path || `/${pathname.split('/')[1]}` === item.path);
  const subMenuList = activeMenu?.children ?? [];

  function changeSubMenu(item: RouteObjectType) {
    const target = item.children?.length ? item.children[0] : item;
    if (target.meta?.isLink) {
      window.open(target.meta.isLink, '_blank', 'noopener,noreferrer');
      return;
    }
    navigate(target.path!);
  }

  return (
    <section className='layout-columns'>
      <div className='sider-split'>
        <div className='logo'>
          <img src={logo} alt='logo' className='logo-img' />
        </div>
        <div className='menu-list'>
          {showMenuList.map(item => {
            const isActive = pathname === item.path || `/${pathname.split('/')[1]}` === item.path;
            return (
              <div key={item.path} className={`menu-item${isActive ? ' menu-active' : ''}`} onClick={() => changeSubMenu(item)}>
                <Icon icon={item.meta!.icon!} />
                <span className='title sle'>{item.meta?.title}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Sider
        width={LAYOUT_SIDER_WIDTH}
        collapsedWidth={LAYOUT_SIDER_COLLAPSED_WIDTH}
        collapsed={isCollapse}
        className={!subMenuList.length ? 'not-sider' : ''}
      >
        {subMenuList.length ? (
          <>
            <div className='logo'>
              <span className='logo-text'>{isCollapse ? 'R' : APP_TITLE}</span>
            </div>
            <LayoutMenu mode='inline' menuList={subMenuList} />
          </>
        ) : null}
      </Sider>
      <LayoutMain
        header={
          <>
            <ToolBarLeft />
            <ToolBarRight />
          </>
        }
      />
    </section>
  );
};

export default LayoutColumns;
