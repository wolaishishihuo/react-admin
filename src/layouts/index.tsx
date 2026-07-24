import { Watermark } from 'antd';
import clsx from 'clsx';
import type React from 'react';
import { useEffect, useRef } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import HeaderBar from '@/layouts/components/HeaderBar';
import LayoutMain from '@/layouts/components/Main';
import Sidebar from '@/layouts/components/Sidebar';
import LayoutTabs from '@/layouts/components/Tabs';
import ThemeDrawer from '@/layouts/components/ThemeDrawer';
import { setGlobalState, useGlobalStore } from '@/stores';
import './index.less';

const LayoutIndex: React.FC = () => {
  const menuType = useGlobalStore(state => state.menuType);
  const watermark = useGlobalStore(state => state.watermark);
  const isCollapse = useGlobalStore(state => state.isCollapse);
  const isMobile = useIsMobile();

  const headerRef = useRef<HTMLElement>(null);

  // 移动端视口自动收起侧栏
  useEffect(() => {
    if (isMobile) setGlobalState({ key: 'isCollapse', value: true });
  }, [isMobile]);

  // 头部实测高度写入 --app-header-height，供列表页视口高度计算
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--app-header-height', `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // top 桌面端不渲染 aside；移动端四模式统一抽屉侧栏
  const showSidebar = menuType !== 'top' || isMobile;

  return (
    <Watermark className='watermark-content' zIndex={1001} content={watermark ? 'Hooks Admin' : ''}>
      <section className='app-layout'>
        {showSidebar && (
          <aside className={clsx('app-sidebar', isCollapse && 'app-sidebar-collapsed')}>
            <Sidebar />
          </aside>
        )}
        <main className='app-main'>
          <header ref={headerRef} className='app-header'>
            <HeaderBar />
            <LayoutTabs />
          </header>
          <div className='app-content'>
            <LayoutMain />
          </div>
        </main>
      </section>
      {/* 移动端侧栏 overlay 展开时的全屏遮罩，点击收起（四模式统一抽屉范式） */}
      {isMobile && !isCollapse && (
        <div className='mobile-sider-mask' onClick={() => setGlobalState({ key: 'isCollapse', value: true })} />
      )}
      <ThemeDrawer />
    </Watermark>
  );
};

export default LayoutIndex;
