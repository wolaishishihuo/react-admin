import { describe, expect, it } from 'vitest';
import { normalizePath, toTanStackRoutePath, unwrapBackendRoutes } from '@/features/navigation/menu-normalize';
import type { BackendRoutePayload } from '@/features/navigation/types';

describe('normalizePath', () => {
  it('补前导斜杠、去掉末尾斜杠和 query/hash', () => {
    expect(normalizePath('home')).toBe('/home');
    expect(normalizePath('/list/useProTable/')).toBe('/list/useProTable');
    expect(normalizePath('/list/useProTable?page=1')).toBe('/list/useProTable');
    expect(normalizePath('/home#hash')).toBe('/home');
    expect(normalizePath('//list///a/')).toBe('/list/a');
  });

  it('根路径保留单个斜杠', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('旧首页 /home/index 映射为 /home', () => {
    expect(normalizePath('/home/index')).toBe('/home');
    expect(normalizePath('/home/index/')).toBe('/home');
  });
});

describe('toTanStackRoutePath', () => {
  it('把后端 :param 转成 $param', () => {
    expect(toTanStackRoutePath('/users/:userId')).toBe('/users/$userId');
    expect(toTanStackRoutePath('users/:userId/profile')).toBe('/users/$userId/profile');
  });
});

describe('unwrapBackendRoutes', () => {
  it('兼容 { routes } 与裸数组', () => {
    const route: BackendRoutePayload = { path: '/home', handle: { title: '首页' } };
    expect(unwrapBackendRoutes({ routes: [route] })).toEqual([route]);
    expect(unwrapBackendRoutes([route])).toEqual([route]);
  });
});
