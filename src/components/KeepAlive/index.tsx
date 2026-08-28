import React, { Activity, useContext, useLayoutEffect, useRef } from "react";
import { useLocation, useMatches, useOutlet } from "react-router-dom";

import { RefreshContext } from "@/context/Refresh";
import { MetaProps } from "@/routers/interface";
import { useGlobalStore, useTabsStore } from "@/stores";

type CachePage = {
  id: string;
  node: React.ReactNode;
};

const replayEnter = (el: HTMLElement) => {
  el.classList.remove("keep-alive-enter");
  void el.offsetWidth;
  el.classList.add("keep-alive-enter");
};

const KeepAlivePage: React.FC<{
  cacheKey: string;
  active: boolean;
  children: React.ReactNode;
}> = ({ cacheKey, active, children }) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = nodeRef.current;
    if (!el) return;
    if (!active) {
      el.classList.remove("keep-alive-enter");
      return;
    }
    replayEnter(el);
  }, [active]);

  return (
    <div ref={nodeRef} className={`keep-alive-item${active ? " is-active" : ""}`}>
      <Activity mode={active ? "visible" : "hidden"} name={cacheKey}>
        {children}
      </Activity>
    </div>
  );
};

const KeepAliveOutlet: React.FC = () => {
  const outlet = useOutlet();
  const matches = useMatches();
  const liveRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<string, CachePage>());
  const prevNonceRef = useRef(0);

  const { pathname, search } = useLocation();
  const { outletShow, refreshNonce } = useContext(RefreshContext);

  const tabs = useGlobalStore(state => state.tabs);
  const tabsList = useTabsStore(state => state.tabsList);

  const cacheKey = pathname + search;
  const meta = matches[matches.length - 1]?.data as (MetaProps & { redirect?: boolean }) | undefined;
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
    cacheRef.current.set(cacheKey, { id: `${cacheKey}:${refreshNonce}`, node: outlet });
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
        <div ref={liveRef} className="keep-alive-item is-active">
          {outletShow && outlet}
        </div>
      )}
    </>
  );
};

export default KeepAliveOutlet;
