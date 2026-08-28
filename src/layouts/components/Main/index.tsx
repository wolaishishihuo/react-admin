import './index.less';

import { useDebounceFn } from 'ahooks';
import React, { useEffect } from 'react';

import KeepAliveOutlet from '@/components/KeepAlive';
import { useGlobalStore } from '@/stores';

import Maximize from './components/Maximize';

const LayoutMain: React.FC = () => {
  const maximize = useGlobalStore(state => state.maximize);
  const isCollapse = useGlobalStore(state => state.isCollapse);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  // 窗口 <1200px 自动折叠侧栏
  const { run } = useDebounceFn(
    () => {
      const screenWidth = document.body.clientWidth;
      const shouldCollapse = screenWidth < 1200;
      if (isCollapse !== shouldCollapse) setGlobalState('isCollapse', shouldCollapse);
    },
    { wait: 100 }
  );
  useEffect(() => {
    window.addEventListener('resize', run, false);
    return () => window.removeEventListener('resize', run);
  }, []);

  // 最大化时给 root 挂 class
  useEffect(() => {
    const root = document.getElementById('root') as HTMLElement;
    root.classList.toggle('main-maximize', maximize);
  }, [maximize]);

  return (
    <React.Fragment>
      <Maximize />
      <KeepAliveOutlet />
    </React.Fragment>
  );
};

export default LayoutMain;
