import { Activity, useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLocation, useMatches, useOutlet } from 'react-router-dom';

import ErrorBoundary from '@/components/ErrorBoundary';
import { RefreshContext } from '@/context/Refresh';
import { type MetaProps } from '@/routers/interface';
import { useGlobalStore, useTabsStore } from '@/stores';
import { getTabId } from '@/utils';

export { RefreshContext, RefreshProvider } from '@/context/Refresh';

type CachePage = {
  id: string;
  node: ReactNode;
};

const replayEnter = (el: HTMLElement) => {
  el.classList.remove('keep-alive-enter');
  void el.offsetWidth;
  el.classList.add('keep-alive-enter');
};

function KeepAlivePage({ cacheKey, active, children }: { cacheKey: string; active: boolean; children: ReactNode }) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    if (!active) {
      el.classList.remove('keep-alive-enter');
      return;
    }
    replayEnter(el);
  }, [active]);

  return (
    <div ref={nodeRef} className={`keep-alive-item${active ? ' is-active' : ''}`}>
      <Activity mode={active ? 'visible' : 'hidden'} name={cacheKey}>
        {children}
      </Activity>
    </div>
  );
}

/** 按 meta.isKeepAlive 缓存 outlet；关闭标签时从 tabsList 同步剔除 */
function KeepAliveOutlet() {
  const outlet = useOutlet();
  const matches = useMatches();
  const liveRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<string, CachePage>());
  const prevNonceRef = useRef(0);

  const { pathname, search } = useLocation();
  const { outletShow, refreshNonce } = useContext(RefreshContext);

  const tabs = useGlobalStore(state => state.tabs);
  const tabsList = useTabsStore(state => state.tabsList);

  const cacheKey = getTabId(pathname + search);
  const lastMatch = matches[matches.length - 1];
  const meta = (lastMatch?.loaderData ?? lastMatch?.data) as (MetaProps & { redirect?: boolean }) | undefined;
  const isKeepAlive = !!meta?.isKeepAlive && !meta.redirect;

  if (refreshNonce !== prevNonceRef.current) {
    prevNonceRef.current = refreshNonce;
    cacheRef.current.delete(cacheKey);
  }

  const aliveKeys = new Set(tabsList.map(item => item.path));
  for (const key of [...cacheRef.current.keys()]) {
    if (key === cacheKey) continue;
    if (tabs && aliveKeys.has(key)) continue;
    cacheRef.current.delete(key);
  }

  if (isKeepAlive && outlet && outletShow && !cacheRef.current.has(cacheKey)) {
    cacheRef.current.set(cacheKey, {
      id: `${cacheKey}:${refreshNonce}`,
      node: <ErrorBoundary>{outlet}</ErrorBoundary>
    });
  }

  useLayoutEffect(() => {
    if (isKeepAlive || !outletShow) return;
    const el = liveRef.current;
    if (el) replayEnter(el);
  }, [cacheKey, isKeepAlive, outletShow]);

  return (
    <>
      {[...cacheRef.current.entries()].map(([key, item]) => (
        <KeepAlivePage active={key === cacheKey && outletShow} cacheKey={key} key={item.id}>
          {item.node}
        </KeepAlivePage>
      ))}
      {!isKeepAlive && (
        <div ref={liveRef} className='keep-alive-item is-active'>
          {outletShow && <ErrorBoundary key={cacheKey}>{outlet}</ErrorBoundary>}
        </div>
      )}
    </>
  );
}

export default KeepAliveOutlet;
