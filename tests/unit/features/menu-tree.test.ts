import { describe, expect, it } from 'vitest';
import { normalizeBackendMenu } from '@/features/navigation/menu-normalize';
import {
  createAuthorizedPathSet,
  filterVisibleMenu,
  flattenMenu,
  getParentPaths,
  intersectMenuWithRoutes
} from '@/features/navigation/menu-tree';
import type { BackendMenuItem } from '@/features/navigation/types';

const backend: BackendMenuItem[] = [
  { path: '/home/index', meta: { key: 'home', title: '首页', isAffix: true } },
  {
    path: '/list',
    redirect: '/list/useProTable',
    meta: { key: 'list', title: '列表' },
    children: [
      {
        path: '/list/useProTable',
        meta: { key: 'useProTable', title: '用户列表', auths: ['add'] }
      },
      {
        path: '/list/useProTable/detail',
        meta: { key: 'detail', title: '用户详情', isHide: true }
      },
      {
        path: '/ghost',
        meta: { key: 'ghost', title: '不存在的页' }
      }
    ]
  }
];

describe('intersectMenuWithRoutes', () => {
  const catalog = new Set(['/home', '/list', '/list/useProTable', '/list/useProTable/detail', '/users/$userId']);
  const tree = intersectMenuWithRoutes(normalizeBackendMenu(backend), catalog);

  it('保留本地存在且后端授权的叶子', () => {
    const paths = flattenMenu(tree).map(item => item.path);
    expect(paths).toContain('/home');
    expect(paths).toContain('/list/useProTable');
    expect(paths).toContain('/list/useProTable/detail');
  });

  it('丢弃后端未知 route', () => {
    expect(flattenMenu(tree).map(item => item.path)).not.toContain('/ghost');
  });

  it('保留有有效 child 的父级 redirect', () => {
    expect(tree.some(item => item.path === '/list' && item.redirect === '/list/useProTable')).toBe(true);
  });

  it('hidden 项仍进入授权集合', () => {
    expect(createAuthorizedPathSet(tree, catalog).has('/list/useProTable/detail')).toBe(true);
    expect(filterVisibleMenu(tree).some(item => item.children.some(child => child.path.includes('detail')))).toBe(false);
  });

  it('仅未知 redirect 的节点不进入菜单或授权集合', () => {
    const next = intersectMenuWithRoutes(
      normalizeBackendMenu([{ path: '/missing', redirect: '/not-in-catalog', meta: { key: 'missing', title: '缺失' } }]),
      catalog
    );
    expect(next).toEqual([]);
    expect(createAuthorizedPathSet(next, catalog).has('/not-in-catalog')).toBe(false);
  });

  it('合法父 path + 未知 redirect 时删除 redirect 并保留节点', () => {
    const next = intersectMenuWithRoutes(
      normalizeBackendMenu([{ path: '/home', redirect: '/not-in-catalog', meta: { key: 'home', title: '首页' } }]),
      catalog
    );
    expect(next[0]?.path).toBe('/home');
    expect(next[0]?.redirect).toBeUndefined();
    expect(createAuthorizedPathSet(next, catalog).has('/not-in-catalog')).toBe(false);
  });

  it('catalog 存在时不把未知 redirect 写入授权集合', () => {
    const leaked = [
      {
        id: 'ghost',
        path: '/home',
        title: '首页',
        hidden: false,
        fixed: false,
        permissions: [],
        children: [],
        redirect: '/not-in-catalog'
      }
    ];
    expect(createAuthorizedPathSet(leaked, catalog).has('/not-in-catalog')).toBe(false);
    expect(createAuthorizedPathSet(leaked, catalog).has('/home')).toBe(true);
  });

  it('动态 redirect 经 :param 转换后可进入授权集合', () => {
    const next = intersectMenuWithRoutes(
      normalizeBackendMenu([
        {
          path: '/users',
          redirect: '/users/:userId',
          meta: { key: 'users', title: '用户' },
          children: [{ path: '/users/:userId', meta: { key: 'user', title: '用户资料' } }]
        }
      ]),
      catalog
    );
    const paths = flattenMenu(next).map(item => item.path);
    expect(paths).toContain('/users/$userId');
    expect(next[0]?.redirect).toBe('/users/$userId');
    expect(createAuthorizedPathSet(next, catalog).has('/users/$userId')).toBe(true);
  });
});

describe('getParentPaths', () => {
  it('按 originPath 精确查找父级', () => {
    const tree = normalizeBackendMenu(backend);
    expect(getParentPaths(tree, '/list/useProTable')).toEqual(['/list']);
  });
});
