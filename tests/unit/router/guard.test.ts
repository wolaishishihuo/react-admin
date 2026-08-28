import { notFound, redirect } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';
import { openExternal } from '@/utils/url';
import { guardAdminRoute } from '@/router/guard';
import type { AppRouterContext } from '@/router/context';
import type * as ReactRouter from '@tanstack/react-router';
import type * as UrlUtils from '@/utils/url';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof ReactRouter>('@tanstack/react-router');
  return {
    ...actual,
    redirect: vi.fn((opts: unknown) => {
      const error = Object.assign(new Error('redirect'), { options: opts });
      throw error;
    }),
    notFound: vi.fn(() => {
      throw new Error('not-found');
    })
  };
});

vi.mock('@/utils/url', async () => {
  const actual = await vi.importActual<typeof UrlUtils>('@/utils/url');
  return { ...actual, openExternal: vi.fn() };
});

vi.mock('@/router/router-ref', () => ({
  getRouter: () => ({
    routeTree: {
      fullPath: '/',
      children: [
        { fullPath: '/home' },
        { fullPath: '/users/$userId' },
        { fullPath: '/list/useProTable' },
        { fullPath: '/iframe/$url' }
      ]
    }
  })
}));

function context(overrides?: Partial<AppRouterContext['auth']>): AppRouterContext {
  const pathMap = new Map([
    ['/home', { path: '/home', title: '首页', id: 'home', hidden: false, fixed: true, permissions: [], children: [] }],
    [
      '/users/$userId',
      { path: '/users/$userId', title: '用户资料', id: 'user', hidden: true, fixed: false, permissions: ['edit'], children: [] }
    ]
  ]);
  return {
    auth: {
      isLoggedIn: true,
      isInitialized: true,
      user: { id: '1', name: 'admin' },
      initialize: async () => ({ id: '1', name: 'admin' }),
      revoke: async () => undefined,
      ...overrides
    },
    navigation: {
      ensureMenu: async () => ({
        tree: [],
        visibleTree: [],
        pathSet: new Set(['/home', '/users/$userId']),
        pathMap,
        permissionMap: new Map([['/users/$userId', ['edit']]])
      })
    }
  };
}

describe('guardAdminRoute', () => {
  it('用户初始化失败时只撤销会话，再由 Guard 保留 redirect 跳登录', async () => {
    const revoke = vi.fn(async () => undefined);
    const initialize = vi.fn(async () => null);
    const ctx = context({ isInitialized: false, initialize, revoke });

    await expect(
      guardAdminRoute({
        context: ctx,
        location: { pathname: '/users/2', href: '/users/2?from=list', searchStr: '?from=list' },
        matches: [{ fullPath: '/users/$userId' }]
      })
    ).rejects.toThrow('redirect');

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledTimes(1);
    expect(vi.mocked(redirect)).toHaveBeenCalledWith({
      to: '/login',
      search: { redirect: '/users/2?from=list' },
      replace: true
    });
  });

  it('动态 pattern 使用最后一个 match.fullPath 授权', async () => {
    await expect(
      guardAdminRoute({
        context: context(),
        location: { pathname: '/users/2', href: '/users/2', searchStr: '' },
        matches: [{ fullPath: '/' }, { fullPath: '/users/$userId' }]
      })
    ).resolves.toBeUndefined();
  });

  it('static 不看后端菜单成员，本地 catalog 内放行', async () => {
    await expect(
      guardAdminRoute({
        context: context(),
        routeMode: 'static',
        location: { pathname: '/list/useProTable', href: '/list/useProTable', searchStr: '' },
        matches: [{ fullPath: '/list/useProTable' }]
      })
    ).resolves.toBeUndefined();
  });

  it('dynamic 下本地存在但未授权的路由走 403', async () => {
    await expect(
      guardAdminRoute({
        context: context(),
        routeMode: 'dynamic',
        location: { pathname: '/list/useProTable', href: '/list/useProTable', searchStr: '' },
        matches: [{ fullPath: '/list/useProTable' }]
      })
    ).rejects.toThrow('redirect');
    expect(vi.mocked(redirect)).toHaveBeenCalledWith({ to: '/403', replace: true });
  });

  it('未知 URL 走 404', async () => {
    await expect(
      guardAdminRoute({
        context: context(),
        location: { pathname: '/ghost', href: '/ghost', searchStr: '' },
        matches: [{ fullPath: '/ghost' }]
      })
    ).rejects.toThrow('not-found');
    expect(vi.mocked(notFound)).toHaveBeenCalled();
  });

  it('static 外链读 matched staticData.href；preload 不打开也不跳转', async () => {
    await expect(
      guardAdminRoute({
        context: context(),
        routeMode: 'static',
        location: { pathname: '/list/useProTable', href: '/list/useProTable', searchStr: '' },
        matches: [{ fullPath: '/list/useProTable', staticData: { href: 'https://static.example' } }],
        preload: true
      })
    ).resolves.toBeUndefined();
    expect(openExternal).not.toHaveBeenCalled();
  });

  it('dynamic 外链同样读 matched staticData.href', async () => {
    const pathMap = new Map([
      [
        '/docs',
        {
          path: '/docs',
          title: '文档',
          id: 'docs',
          hidden: false,
          fixed: false,
          permissions: [],
          children: []
        }
      ]
    ]);
    const ctx = context();
    ctx.navigation.ensureMenu = async () => ({
      tree: [],
      visibleTree: [],
      pathSet: new Set(['/docs']),
      pathMap,
      permissionMap: new Map()
    });

    await expect(
      guardAdminRoute({
        context: ctx,
        routeMode: 'dynamic',
        location: { pathname: '/docs', href: '/docs', searchStr: '' },
        matches: [{ fullPath: '/docs', staticData: { href: 'https://example.com' } }]
      })
    ).rejects.toThrow('redirect');
    expect(openExternal).toHaveBeenCalledWith('https://example.com');
    expect(vi.mocked(redirect)).toHaveBeenCalledWith({ to: '/home', replace: true });
  });

  it('从后往前找 href：父级 layout 的 href 会带走子页', async () => {
    vi.mocked(openExternal).mockClear();
    await expect(
      guardAdminRoute({
        context: context(),
        routeMode: 'static',
        location: { pathname: '/list/useProTable', href: '/list/useProTable', searchStr: '' },
        matches: [{ fullPath: '/list', staticData: { href: 'https://parent.example' } }, { fullPath: '/list/useProTable' }]
      })
    ).rejects.toThrow('redirect');
    expect(openExternal).toHaveBeenCalledWith('https://parent.example');
    expect(vi.mocked(redirect)).toHaveBeenCalledWith({ to: '/home', replace: true });
  });

  it('首页外链打开后回 /404，避免循环', async () => {
    vi.mocked(openExternal).mockClear();
    await expect(
      guardAdminRoute({
        context: context(),
        routeMode: 'static',
        location: { pathname: '/home', href: '/home', searchStr: '' },
        matches: [{ fullPath: '/home', staticData: { href: 'https://home.example' } }]
      })
    ).rejects.toThrow('redirect');
    expect(openExternal).toHaveBeenCalledWith('https://home.example');
    expect(vi.mocked(redirect)).toHaveBeenCalledWith({ to: '/404', replace: true });
  });

  it('staticData.url 不是外链，不打开新窗口', async () => {
    vi.mocked(openExternal).mockClear();
    await expect(
      guardAdminRoute({
        context: context(),
        routeMode: 'static',
        location: { pathname: '/iframe/https%3A%2F%2Fexample.com', href: '/iframe/https%3A%2F%2Fexample.com', searchStr: '' },
        matches: [{ fullPath: '/iframe/$url', staticData: { url: 'https://example.com' } }]
      })
    ).resolves.toBeUndefined();
    expect(openExternal).not.toHaveBeenCalled();
  });
});
