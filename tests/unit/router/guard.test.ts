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
      children: [{ fullPath: '/home' }, { fullPath: '/users/$userId' }, { fullPath: '/list/useProTable' }]
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

  it('本地存在但未授权的动态路由走 403', async () => {
    await expect(
      guardAdminRoute({
        context: context(),
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

  it('external preload 不打开窗口，非 preload 才 openExternal', async () => {
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
          children: [],
          external: 'https://example.com'
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
        location: { pathname: '/docs', href: '/docs', searchStr: '' },
        matches: [{ fullPath: '/docs' }],
        preload: true
      })
    ).rejects.toThrow('redirect');
    expect(openExternal).not.toHaveBeenCalled();

    await expect(
      guardAdminRoute({
        context: ctx,
        location: { pathname: '/docs', href: '/docs', searchStr: '' },
        matches: [{ fullPath: '/docs' }]
      })
    ).rejects.toThrow('redirect');
    expect(openExternal).toHaveBeenCalledWith('https://example.com');
  });
});
