/** 以纯函数维护 keepAlive 条目：淘汰已关闭项，并持续刷新活动页面的路由快照。 */
import type { RouterStateSnapshot } from './snapshot-router';

export interface CacheEntry {
  key: string;
  contentKey: string;
  routeState: RouterStateSnapshot;
}

export function getKeepAliveKeys(options: { activeCacheKey: string; routeKeepAlive?: boolean; keepAliveTabIds: string[] }) {
  const keepAliveKeys = [...options.keepAliveTabIds];
  if (options.routeKeepAlive && options.activeCacheKey && !keepAliveKeys.includes(options.activeCacheKey)) {
    keepAliveKeys.push(options.activeCacheKey);
  }
  return keepAliveKeys;
}

export function syncCacheEntries(options: {
  activeCacheKey: string;
  contentKey: string;
  entries: CacheEntry[];
  keepAliveKeys: string[];
  routeState: RouterStateSnapshot;
  shouldRenderContent: boolean;
}): CacheEntry[] {
  const { activeCacheKey, contentKey, entries, keepAliveKeys, routeState, shouldRenderContent } = options;
  const keepAliveKeySet = new Set(keepAliveKeys);
  const nextEntries = entries.filter(entry => keepAliveKeySet.has(entry.key));

  if (!shouldRenderContent) {
    return nextEntries.filter(entry => entry.key !== activeCacheKey);
  }

  if (!keepAliveKeySet.has(activeCacheKey)) return nextEntries;

  // 活动条目必须整体替换，确保下次切回读取最后一次导航后的 state 和刷新 key。
  const activeEntry: CacheEntry = { key: activeCacheKey, contentKey, routeState };
  const activeIndex = nextEntries.findIndex(entry => entry.key === activeCacheKey);
  if (activeIndex === -1) return [...nextEntries, activeEntry];
  return nextEntries.map(entry => (entry.key === activeCacheKey ? activeEntry : entry));
}
