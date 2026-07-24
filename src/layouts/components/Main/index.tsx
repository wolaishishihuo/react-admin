import { useDebounceFn } from 'ahooks';
import { KeepAlive, useKeepAliveRef } from 'keepalive-for-react';
import React from 'react';
import { useEffect, useMemo } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setGlobalState, useGlobalStore, useAuthStore } from '@/stores';
import { setKeepAliveRef } from '@/utils/keepAlive';
import Maximize from './components/Maximize';

const LayoutMain: React.FC = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const aliveRef = useKeepAliveRef();

  // 缓存 key 与 Tabs 标签 key 一致（pathname + search）
  const cacheKey = location.pathname + location.search;

  const maximize = useGlobalStore(state => state.maximize);
  const isCollapse = useGlobalStore(state => state.isCollapse);
  const flatMenuList = useAuthStore(state => state.flatMenuList);

  // 注入 KeepAlive ref，供 tabs action 命令式销毁/刷新
  useEffect(() => {
    setKeepAliveRef(aliveRef);
    return () => setKeepAliveRef(null);
  }, [aliveRef]);

  // KeepAlive include：仅 isKeepAlive 页，正则匹配 pathname
  const include = useMemo(
    () =>
      flatMenuList
        .filter(item => item.meta?.isKeepAlive === true)
        .map(item => new RegExp(`^${item.path!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\?|$)`)),
    [flatMenuList]
  );

  // 窗口 <1200px 自动折叠侧栏
  const { run } = useDebounceFn(
    () => {
      const screenWidth = document.body.clientWidth;
      const shouldCollapse = screenWidth < 1200;
      if (isCollapse !== shouldCollapse) setGlobalState({ key: 'isCollapse', value: shouldCollapse });
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
      <div className='p-20px box-border'>
        <KeepAlive aliveRef={aliveRef} activeCacheKey={cacheKey} include={include} max={15}>
          {/* 页面级错误边界，key 随路由变化复位错误态 */}
          <ErrorBoundary key={cacheKey}>{outlet}</ErrorBoundary>
        </KeepAlive>
      </div>
    </React.Fragment>
  );
};

export default LayoutMain;
