import { describe, expect, it } from 'vitest';
import { getKeepAliveKeys, syncCacheEntries, type CacheEntry } from '@/layouts/cache/cache-entries';
import type { RouterStateSnapshot } from '@/layouts/cache/snapshot-router';

function state(href: string, extra?: Record<string, unknown>): RouterStateSnapshot {
  return { location: { href }, ...extra } as RouterStateSnapshot;
}

describe('cache entries', () => {
  it('关闭 tab 后 entry 消失', () => {
    const entries: CacheEntry[] = [
      { key: '/list/useProTable', contentKey: '1', routeState: state('/list/useProTable') },
      { key: '/list/useProTable/detail?id=1', contentKey: '1', routeState: state('/list/useProTable/detail?id=1') }
    ];
    const next = syncCacheEntries({
      activeCacheKey: '/list/useProTable',
      contentKey: '1',
      entries,
      keepAliveKeys: ['/list/useProTable'],
      routeState: state('/list/useProTable'),
      shouldRenderContent: true
    });
    expect(next.map(item => item.key)).toEqual(['/list/useProTable']);
  });

  it('同 location 仍替换最新 router.state，pane key 与 contentKey 保持稳定', () => {
    const prevState = state('/list/useProTable', { statusCode: 200 });
    const nextState = state('/list/useProTable', { statusCode: 200, loadedAt: 2 });
    const entries: CacheEntry[] = [{ key: '/list/useProTable', contentKey: '1', routeState: prevState }];
    const next = syncCacheEntries({
      activeCacheKey: '/list/useProTable',
      contentKey: '1',
      entries,
      keepAliveKeys: ['/list/useProTable'],
      routeState: nextState,
      shouldRenderContent: true
    });
    expect(next[0]?.key).toBe('/list/useProTable');
    expect(next[0]?.contentKey).toBe('1');
    expect(next[0]?.routeState).toBe(nextState);
    expect(next[0]).not.toBe(entries[0]);
  });

  it('refresh 会更换 contentKey', () => {
    const entries: CacheEntry[] = [{ key: '/list/useProTable', contentKey: '1', routeState: state('/list/useProTable') }];
    const next = syncCacheEntries({
      activeCacheKey: '/list/useProTable',
      contentKey: '2',
      entries,
      keepAliveKeys: ['/list/useProTable'],
      routeState: state('/list/useProTable'),
      shouldRenderContent: true
    });
    expect(next[0]?.contentKey).toBe('2');
    expect(next[0]?.key).toBe('/list/useProTable');
  });

  it('当前非 keepAlive 时不写入 entry', () => {
    expect(getKeepAliveKeys({ activeCacheKey: '/home', routeKeepAlive: false, keepAliveTabIds: ['/list/useProTable'] })).toEqual([
      '/list/useProTable'
    ]);
  });
});
