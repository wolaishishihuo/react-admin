import './index.css';
import { Layout } from 'antd';
import { useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import logo from '@/assets/images/logo.png';
import CollapseIcon from '@/layouts/components/Header/components/CollapseIcon';
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft';
import ToolBarRight from '@/layouts/components/Header/ToolBarRight';
import LayoutMain from '@/layouts/components/Main';
import LayoutMenu from '@/layouts/components/Menu';
import { LAYOUT_SIDER_COLLAPSED_WIDTH, LAYOUT_SIDER_WIDTH } from '@/layouts/constants';
import { useAuthStore, useGlobalStore } from '@/stores';
import { getFirstLevelMenuList } from '@/utils';

const { Header, Sider } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutClassic = () => {
  const { pathname } = useLocation();

  const { isCollapse, menuSplit } = useGlobalStore(
    useShallow(state => ({
      isCollapse: state.isCollapse,
      menuSplit: state.menuSplit
    }))
  );
  const showMenuList = useAuthStore(state => state.showMenuList);
  const firstLevelMenuList = getFirstLevelMenuList(showMenuList);
  const activeMenu = menuSplit
    ? showMenuList.find(item => pathname === item.path || `/${pathname.split('/')[1]}` === item.path)
    : undefined;
  const subMenuList = activeMenu?.children ?? [];

  return (
    <section className='layout-classic'>
      <Header>
        <div className={`header-lf ${menuSplit ? 'hide-logo' : 'mask-image'}`}>
          <div className='logo'>
            <img src={logo} alt='logo' className='logo-img' />
            <h2 className='logo-text'>{APP_TITLE}</h2>
          </div>
          {menuSplit ? <LayoutMenu mode='horizontal' menuList={firstLevelMenuList} menuSplit={true} /> : <ToolBarLeft />}
        </div>
        <div className='header-ri'>
          <ToolBarRight />
        </div>
      </Header>
      <div className='classic-content'>
        <Sider
          width={LAYOUT_SIDER_WIDTH}
          collapsedWidth={LAYOUT_SIDER_COLLAPSED_WIDTH}
          collapsed={isCollapse}
          className={`${!subMenuList.length && menuSplit ? 'not-sider' : ''}`}
        >
          {menuSplit ? (
            <>
              {subMenuList.length ? (
                <>
                  <LayoutMenu mode='inline' menuList={subMenuList} />
                  <div className='collapse-box'>
                    <CollapseIcon />
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <LayoutMenu mode='inline' />
          )}
        </Sider>
        <div className='classic-main'>
          <LayoutMain />
        </div>
      </div>
    </section>
  );
};

export default LayoutClassic;
