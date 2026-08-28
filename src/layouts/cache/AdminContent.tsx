/**
 * 后台内容渲染核心：普通路由渲染 live Outlet，keepAlive 路由保留隐藏 Pane 和 router state 快照。
 * contentRevision 只重建页面内容；缓存 Pane 首次创建、切回和刷新均不播放进入动画。
 */
import { ConfigProvider, Modal } from 'antd';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Outlet, RouterContextProvider, useRouter } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuthorizedNavigation } from '@/features/navigation/menu-model';
import { getTabId } from '@/stores/modules/tab-identity';
import { useAdminLayoutStore } from '@/stores/modules/admin-layout.store';
import { useTabsStore } from '@/stores/modules/tabs.store';
import { useRoute } from '@/router/use-route';
import { getKeepAliveKeys, syncCacheEntries, type CacheEntry } from './cache-entries';
import { pageAnimationTransitions, pageAnimationVariants, resolvePageAnimationMode } from './page-animation';
import { createSnapshotRouter, type RouterStateSnapshot } from './snapshot-router';

interface CachedRoutePaneBodyProps {
  animationMode: ReturnType<typeof resolvePageAnimationMode>;
  contentKey: string;
  routeState: RouterStateSnapshot;
}

const CachedRoutePaneBody = memo(function CachedRoutePaneBody(props: CachedRoutePaneBodyProps) {
  const { animationMode, contentKey, routeState } = props;
  const paneRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const snapshotRouter = useMemo(() => createSnapshotRouter(router, routeState), [router, routeState]);
  const getPopupContainer = useCallback(() => paneRef.current ?? document.body, []);

  return (
    <div ref={paneRef} className='h-full'>
      <ConfigProvider getPopupContainer={getPopupContainer}>
        <RouterContextProvider router={snapshotRouter}>
          <motion.div
            animate='animate'
            className='h-full'
            data-page-animation={animationMode}
            initial={false}
            key={contentKey}
            transition={pageAnimationTransitions[animationMode]}
            variants={pageAnimationVariants[animationMode]}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </RouterContextProvider>
      </ConfigProvider>
    </div>
  );
});

function CachedRoutePane(props: {
  active: boolean;
  animationMode: ReturnType<typeof resolvePageAnimationMode>;
  cacheKey: string;
  contentKey: string;
  routeState: RouterStateSnapshot;
}) {
  const { active, animationMode, cacheKey, contentKey, routeState } = props;

  return (
    <div aria-hidden={!active} className='h-full' data-keep-alive-key={cacheKey} style={{ display: active ? undefined : 'none' }}>
      <CachedRoutePaneBody animationMode={animationMode} contentKey={contentKey} routeState={routeState} />
    </div>
  );
}

export default function AdminContent() {
  const router = useRouter();
  const route = useRoute();
  const prefersReducedMotion = useReducedMotion();
  const pageAnimate = useAdminLayoutStore(state => state.pageAnimate);
  const pageAnimateMode = useAdminLayoutStore(state => state.pageAnimateMode);
  const { pathMap } = useAuthorizedNavigation();
  const animationMode = resolvePageAnimationMode({
    pageAnimate,
    pageAnimateMode,
    prefersReducedMotion
  });
  const multi = Boolean(pathMap.get(route.originPath)?.multi ?? route.staticData.tab?.multi);
  const activeCacheKey = getTabId(route.originPath, multi, route.fullPath);
  // Tab.keepAlive 跟菜单项；停在当前页时再用 staticData.keepAlive 建 pane，离开后若 Tab 未缓存会卸掉。
  const routeKeepAlive = Boolean(route.staticData.keepAlive);
  const contentRevision = useTabsStore(state => state.contentRevision[activeCacheKey] ?? 0);
  const keepAliveTabIds = useTabsStore(
    useShallow(state => [state.homeTab, ...state.tabs].filter(tab => tab.keepAlive).map(tab => tab.id))
  );
  const entriesRef = useRef<CacheEntry[]>([]);

  useEffect(() => {
    Modal.destroyAll();
  }, [activeCacheKey]);

  const keepAliveKeys = getKeepAliveKeys({
    activeCacheKey,
    routeKeepAlive,
    keepAliveTabIds
  });
  const contentKey = `${activeCacheKey}:${contentRevision}`;
  // 每次渲染都用最新 router.state 替换活动缓存项，隐藏项继续保留各自快照。
  const keepAliveEntries = syncCacheEntries({
    activeCacheKey,
    contentKey,
    entries: entriesRef.current,
    keepAliveKeys,
    routeState: router.state as unknown as RouterStateSnapshot,
    shouldRenderContent: true
  });
  entriesRef.current = keepAliveEntries;
  const isActiveRouteCached = keepAliveEntries.some(entry => entry.key === activeCacheKey);

  return (
    <div className='p-20px min-h-0 box-border relative overflow-x-hidden'>
      {keepAliveEntries.map(entry => (
        <CachedRoutePane
          active={entry.key === activeCacheKey}
          animationMode={animationMode}
          cacheKey={entry.key}
          contentKey={entry.contentKey}
          key={entry.key}
          routeState={entry.routeState}
        />
      ))}
      {!isActiveRouteCached && (
        <motion.div
          animate='animate'
          className='h-full'
          data-page-animation={animationMode}
          initial='initial'
          key={contentKey}
          transition={pageAnimationTransitions[animationMode]}
          variants={pageAnimationVariants[animationMode]}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </motion.div>
      )}
    </div>
  );
}
