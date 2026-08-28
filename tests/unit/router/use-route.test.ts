import { describe, expect, it } from 'vitest';
import { getMenuSelectPath, getOriginPathFromMatches, selectRouteIdentity } from '@/router/use-route';

describe('route identity', () => {
  it('originPath 使用最后一个 match 的 fullPath pattern', () => {
    expect(getOriginPathFromMatches([{ fullPath: '/' }, { fullPath: '/users/$userId' }])).toBe('/users/$userId');
  });

  it('fullPath 拼接实际 pathname 与 search', () => {
    const route = selectRouteIdentity([
      {
        fullPath: '/users/$userId',
        pathname: '/users/2',
        search: { tab: 'profile' },
        params: { userId: '2' },
        staticData: { title: '用户资料', menu: { activeMenu: '/list/useProTable' } }
      }
    ]);
    expect(route.originPath).toBe('/users/$userId');
    expect(route.pathname).toBe('/users/2');
    expect(route.fullPath).toBe('/users/2?tab=profile');
    expect(route.params).toEqual({ userId: '2' });
    expect(getMenuSelectPath(route)).toBe('/list/useProTable');
  });

  it('没有 activeMenu 时菜单选中 originPath', () => {
    expect(getMenuSelectPath({ originPath: '/home', staticData: {} })).toBe('/home');
  });
});
