import { describe, expect, it } from 'vitest';
import {
  collectAvailableRoutePaths,
  createBackendRouteNormalizer,
  hasAuthorizedRoutePath
} from '@/features/navigation/dynamic-routes';
import { createAuthorizedPathSet, createMenuPathMap, filterVisibleMenu, flattenMenu } from '@/features/navigation/menu-tree';
import type { BackendRoutePayload } from '@/features/navigation/types';

const routeTree = {
  fullPath: '/',
  children: [
    { fullPath: '/home' },
    { fullPath: '/list' },
    { fullPath: '/list/useProTable' },
    { fullPath: '/list/useProTable/detail' },
    { fullPath: '/users/$userId' },
    { fullPath: '/iframe/$url' }
  ]
};

const backend: BackendRoutePayload[] = [
  { path: '/home/index', handle: { title: '首页', fixedIndexInTab: 0 } },
  {
    path: '/list',
    redirect: '/list/useProTable',
    handle: { title: '列表' },
    children: [
      {
        path: '/list/useProTable',
        handle: { title: '用户列表', buttons: ['add'] }
      },
      {
        path: '/list/useProTable/detail',
        handle: { title: '用户详情', hideInMenu: true }
      },
      {
        path: '/ghost',
        handle: { title: '不存在的页' }
      }
    ]
  }
];

describe('createBackendRouteNormalizer', () => {
  const tree = createBackendRouteNormalizer(routeTree)(backend);

  it('保留本地 catalog 内的叶子，并映射 handle', () => {
    const paths = flattenMenu(tree).map(item => item.path);
    expect(paths).toContain('/home');
    expect(paths).toContain('/list/useProTable');
    expect(paths).toContain('/list/useProTable/detail');
    expect(tree[0]).toMatchObject({ path: '/home', fixed: true, permissions: [] });
    expect(tree[1]?.children[0]).toMatchObject({ path: '/list/useProTable', permissions: ['add'] });
  });

  it('丢掉 catalog 没有的 path', () => {
    expect(flattenMenu(tree).map(item => item.path)).not.toContain('/ghost');
  });

  it('不消费 redirect，父节点仍保留', () => {
    expect(tree.some(item => item.path === '/list')).toBe(true);
    expect(tree.find(item => item.path === '/list')).not.toHaveProperty('redirect');
  });

  it('hidden 项仍进入 pathMap / 授权集合，但不出现在可见树', () => {
    const pathMap = createMenuPathMap(tree);
    expect(pathMap.has('/list/useProTable/detail')).toBe(true);
    expect(createAuthorizedPathSet(tree).has('/list/useProTable/detail')).toBe(true);
    expect(filterVisibleMenu(tree).some(item => item.children.some(child => child.path.includes('detail')))).toBe(false);
  });

  it('父级不在 catalog 时子级一并丢弃', () => {
    const next = createBackendRouteNormalizer(routeTree)([
      {
        path: '/missing-group',
        handle: { title: '分组' },
        children: [{ path: '/list/useProTable', handle: { title: '用户列表' } }]
      }
    ]);
    expect(next).toEqual([]);
  });

  it('handle 与 meta 等价，并保留 keepAlive 三态', () => {
    const next = createBackendRouteNormalizer(routeTree)([
      { path: '/home', meta: { title: '开启', keepAlive: true } },
      { path: '/list', handle: { title: '关闭', keepAlive: false } },
      { path: '/users/$userId', handle: { title: '未配置' } }
    ]);
    expect(next.map(item => item.keepAlive)).toEqual([true, false, undefined]);
  });

  it('activeMenu 仅在 catalog 内时保留，外链只接受 http(s)', () => {
    const next = createBackendRouteNormalizer(routeTree)([
      {
        path: '/users/:userId',
        handle: {
          title: '用户资料',
          href: 'https://example.com',
          hideInMenu: true,
          multiTab: true,
          activeMenu: '/list/useProTable'
        }
      },
      {
        path: '/home',
        handle: { title: '恶意外链', href: 'javascript:alert(1)', activeMenu: '/not-in-catalog' }
      }
    ]);
    expect(next[0]).toMatchObject({
      path: '/users/$userId',
      external: 'https://example.com',
      hidden: true,
      multi: true,
      activeMenu: '/list/useProTable'
    });
    expect(next[1]?.external).toBeUndefined();
    expect(next[1]?.activeMenu).toBeUndefined();
  });

  it('合法 url 拷到 iframe；无本地文件仍丢掉；非法 url 丢弃', () => {
    const next = createBackendRouteNormalizer(routeTree)([
      { path: '/home', handle: { title: '首页', url: 'https://example.com/home' } },
      { path: '/ghost-docs', handle: { title: '文档', url: 'https://example.com/docs' } },
      { path: '/list', handle: { title: '列表', url: 'javascript:alert(1)' } }
    ]);
    expect(next.map(item => item.path)).toEqual(['/home', '/list']);
    expect(next[0]?.iframe).toBe('https://example.com/home');
    expect(next[1]?.iframe).toBeUndefined();
  });

  it('href 与 url 可同时保留', () => {
    const next = createBackendRouteNormalizer(routeTree)([
      { path: '/home', handle: { title: '首页', href: 'https://a.example', url: 'https://b.example' } }
    ]);
    expect(next[0]?.external).toBe('https://a.example');
    expect(next[0]?.iframe).toBe('https://b.example');
  });
});

describe('collectAvailableRoutePaths / hasAuthorizedRoutePath', () => {
  it('收集本地 fullPath', () => {
    expect(collectAvailableRoutePaths(routeTree).has('/list/useProTable')).toBe(true);
    expect(collectAvailableRoutePaths(routeTree).has('/ghost')).toBe(false);
  });

  it('static 一律放行，dynamic 看 pathMap', () => {
    const navigation = { pathMap: createMenuPathMap(createBackendRouteNormalizer(routeTree)(backend)) };
    expect(hasAuthorizedRoutePath('/ghost', navigation, 'static')).toBe(true);
    expect(hasAuthorizedRoutePath('/home', navigation, 'dynamic')).toBe(true);
    expect(hasAuthorizedRoutePath('/ghost', navigation, 'dynamic')).toBe(false);
  });
});
