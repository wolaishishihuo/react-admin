import './index.less';

import { Layout } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import logo from '@/assets/images/logo.png';
import CollapseIcon from '@/layouts/components/Header/components/CollapseIcon';
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft';
import ToolBarRight from '@/layouts/components/Header/ToolBarRight';
import LayoutMain from '@/layouts/components/Main';
import LayoutMenu from '@/layouts/components/Menu';
import { LAYOUT_SIDER_COLLAPSED_WIDTH, LAYOUT_SIDER_WIDTH } from '@/layouts/constants';
import { RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore } from '@/stores';
import { getFirstLevelMenuList } from '@/utils';

const { Header, Sider } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutClassic: React.FC = () => {
  const { pathname } = useLocation();

  const { isCollapse, menuSplit } = useGlobalStore(state => ({
    isCollapse: state.isCollapse,
    menuSplit: state.menuSplit
  }));
  const showMenuList = useAuthStore(state => state.showMenuList);
  const firstLevelMenuList = getFirstLevelMenuList(showMenuList);

  const [subMenuList, setSubMenuList] = useState<RouteObjectType[]>([]);

  useEffect(() => {
    if (menuSplit) changeSubMenu();
  }, [pathname, menuSplit]);

  const changeSubMenu = () => {
    const menuItem = showMenuList.find(item => {
      return pathname === item.path || `/${pathname.split('/')[1]}` === item.path;
    });
    setSubMenuList(menuItem?.children || []);
  };

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
            <React.Fragment>
              {subMenuList.length ? (
                <React.Fragment>
                  <LayoutMenu mode='inline' menuList={subMenuList} />
                  <div className='collapse-box'>
                    <CollapseIcon />
                  </div>
                </React.Fragment>
              ) : null}
            </React.Fragment>
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
