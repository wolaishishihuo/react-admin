import { Watermark } from 'antd';
import clsx from 'clsx';
import { useDebounceFn } from 'ahooks';
import { useEffect, useRef } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import { patchAdminLayout, useAdminLayoutStore } from '@/stores/modules/admin-layout.store';
import AdminContent from './cache/AdminContent';
import HeaderBar from './HeaderBar';
import Maximize from './Maximize';
import Sidebar from './Sidebar';
import LayoutTabs from './Tabs';
import ThemeDrawer from './ThemeDrawer';
import './AdminLayout.less';

export default function AdminLayout() {
  const menuType = useAdminLayoutStore(state => state.menuType);
  const watermark = useAdminLayoutStore(state => state.watermark);
  const isCollapse = useAdminLayoutStore(state => state.isCollapse);
  const maximize = useAdminLayoutStore(state => state.maximize);
  const isMobile = useIsMobile();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isMobile) patchAdminLayout({ isCollapse: true });
  }, [isMobile]);

  useEffect(() => {
    document.getElementById('root')?.classList.toggle('main-maximize', maximize);
  }, [maximize]);

  const { run: syncCollapseByWidth } = useDebounceFn(
    () => {
      const shouldCollapse = document.body.clientWidth < 1200;
      if (isCollapse !== shouldCollapse) patchAdminLayout({ isCollapse: shouldCollapse });
    },
    { wait: 100 }
  );

  useEffect(() => {
    window.addEventListener('resize', syncCollapseByWidth);
    return () => window.removeEventListener('resize', syncCollapseByWidth);
  }, [syncCollapseByWidth]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--app-header-height', `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

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
            <Maximize />
            <AdminContent />
          </div>
        </main>
      </section>
      {isMobile && !isCollapse && <div className='mobile-sider-mask' onClick={() => patchAdminLayout({ isCollapse: true })} />}
      <ThemeDrawer />
    </Watermark>
  );
}
