import './index.less';

import { Layout } from 'antd';
import React from 'react';

import logo from '@/assets/images/logo.svg';
import LayoutMenu from '@/layouts/components//Menu';
import ToolBarLeft from '@/layouts/components/Header/ToolBarLeft';
import ToolBarRight from '@/layouts/components/Header/ToolBarRight';
import LayoutMain from '@/layouts/components/Main';
import { useGlobalStore } from '@/stores';

const { Header, Sider } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutVertical: React.FC = () => {
  const isCollapse = useGlobalStore(state => state.isCollapse);

  return (
    <section className='layout-vertical'>
      <Sider width={230} collapsedWidth={64} collapsed={isCollapse}>
        <div className='logo'>
          <img src={logo} alt='logo' className='logo-img' />
          {!isCollapse && <h2 className='logo-text'>{APP_TITLE}</h2>}
        </div>
        <LayoutMenu mode='inline' />
      </Sider>
      <Layout>
        <Header>
          <ToolBarLeft />
          <ToolBarRight />
        </Header>
        <LayoutMain />
      </Layout>
    </section>
  );
};

export default LayoutVertical;
