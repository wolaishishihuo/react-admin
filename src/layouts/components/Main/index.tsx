import './index.css';
import { useDebounceFn } from 'ahooks';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import KeepAliveOutlet from '@/components/KeepAlive';
import LayoutFooter from '@/layouts/components/Footer';
import LayoutTabs from '@/layouts/components/Tabs';
import { useGlobalStore } from '@/stores';

import Maximize from './components/Maximize';

interface LayoutMainProps {
  /** 顶部栏内容 */
  header?: ReactNode;
}

const LayoutMain = (props: LayoutMainProps) => {
  const { header } = props;
  const { maximize, isCollapse, setGlobalState } = useGlobalStore(
    useShallow(state => ({
      maximize: state.maximize,
      isCollapse: state.isCollapse,
      setGlobalState: state.setGlobalState
    }))
  );

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
  }, [run]);

  useEffect(() => {
    const root = document.getElementById('root') as HTMLElement;
    root.classList.toggle('main-maximize', maximize);
  }, [maximize]);

  return (
    <main className='app-main'>
      <header className='app-header'>
        {header && <div className='app-header-bar'>{header}</div>}
        <LayoutTabs />
      </header>
      <Maximize />
      <div className='app-content'>
        <KeepAliveOutlet />
      </div>
      <LayoutFooter />
    </main>
  );
};

export default LayoutMain;
