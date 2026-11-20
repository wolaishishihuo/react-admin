import './index.css';
import { Layout } from 'antd';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import logo from '@/assets/images/logo.png';
import { Icon } from '@/components/Icon';
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft';
import ToolBarRight from '@/layouts/components/Header/ToolBarRight';
import LayoutMain from '@/layouts/components/Main';
import LayoutMenu from '@/layouts/components/Menu';
import { LAYOUT_SIDER_COLLAPSED_WIDTH, LAYOUT_SIDER_WIDTH } from '@/layouts/constants';
import type { MetaProps, RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore } from '@/stores';
import { findMenuBranch } from '@/utils';

const { Sider } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutColumns = () => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isCollapse = useGlobalStore(state => state.isCollapse);
  const { authMenuList, showMenuList } = useAuthStore(
    useShallow(state => ({
      authMenuList: state.authMenuList,
      showMenuList: state.showMenuList
    }))
  );

  const meta = matches[matches.length - 1]?.data as MetaProps | undefined;
  const activePath = meta?.activeMenu ?? pathname;
  const activeTopPath = findMenuBranch(authMenuList, activePath)[0]?.path;
  const activeMenu = activeTopPath ? showMenuList.find(item => item.path === activeTopPath) : undefined;
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
            const isActive = item.path === activeTopPath;
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
