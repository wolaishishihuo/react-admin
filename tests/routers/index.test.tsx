import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import { App as AppProvider } from 'antd';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createdRouters, disposeSpies } = vi.hoisted(() => ({
  createdRouters: [] as Array<{ dispose: () => void }>,
  disposeSpies: [] as ReturnType<typeof vi.fn>[]
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  const wrapRouter = <T extends { dispose: () => void }>(router: T): T => {
    const originalDispose = router.dispose.bind(router);
    const spy = vi.fn(() => originalDispose());
    router.dispose = spy;
    createdRouters.push({ dispose: originalDispose });
    disposeSpies.push(spy);
    return router;
  };
  return {
    ...actual,
    createBrowserRouter: (...args: Parameters<typeof actual.createBrowserRouter>) =>
      wrapRouter(actual.createBrowserRouter(...args)),
    createHashRouter: (...args: Parameters<typeof actual.createHashRouter>) => wrapRouter(actual.createHashRouter(...args))
  };
});

vi.mock('@/routers/helper/ConvertRouter', () => ({
  convertToDynamicRouterFormat: () => [
    {
      path: '/home/index',
      loader: () => ({ title: '首页' }),
      element: <div>home-page</div>
    }
  ]
}));

vi.mock('@/routers/helper/initPermissions', () => ({
  initPermissions: vi.fn(async () => {})
}));

import { createQueryClient } from '@/apis/query';
import RouterProvider from '@/routers';
import { useAuthStore, useTabsStore, useUserStore } from '@/stores';

describe('RouterProvider router lifecycle', () => {
  beforeEach(() => {
    createdRouters.length = 0;
    disposeSpies.length = 0;
    window.location.hash = '#/home/index';
    useUserStore.setState({ token: '', refreshToken: '' });
    useAuthStore.setState({ authMenuList: [], flatMenuList: [], showMenuList: [], authButtons: [] });
    useTabsStore.setState({ tabsList: [] });
  });

  afterEach(() => {
    createdRouters.forEach(router => router.dispose());
    createdRouters.length = 0;
    document.documentElement.removeAttribute('style');
    document.documentElement.classList.remove('dark');
  });

  it('disposes the previous router whenever static and dynamic routers are swapped', async () => {
    const queryClient = createQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <RouterProvider />
        </AppProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(disposeSpies).toHaveLength(1);
    });
    expect(disposeSpies[0]).not.toHaveBeenCalled();

    // Login completes -> swaps to dynamic router and disposes old static router
    act(() => {
      useUserStore.setState({ token: 'valid-token' });
      useAuthStore.getState().setAuthMenuList([{ path: '/home/index', meta: { title: '首页' } }]);
    });

    await waitFor(() => {
      expect(disposeSpies).toHaveLength(2);
      expect(disposeSpies[0]).toHaveBeenCalledTimes(1);
    });
    expect(disposeSpies[1]).not.toHaveBeenCalled();

    // Logout -> swaps back to static router and disposes old dynamic router
    act(() => {
      useUserStore.setState({ token: '' });
      useAuthStore.setState({ authMenuList: [], flatMenuList: [], showMenuList: [], authButtons: [] });
    });

    await waitFor(() => {
      expect(disposeSpies).toHaveLength(3);
      expect(disposeSpies[1]).toHaveBeenCalledTimes(1);
    });
    expect(disposeSpies[2]).not.toHaveBeenCalled();
  });

  it('does not dispose the active router on StrictMode double-invoked effects', async () => {
    const queryClient = createQueryClient();

    render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <RouterProvider />
          </AppProvider>
        </QueryClientProvider>
      </StrictMode>
    );

    await waitFor(() => {
      expect(disposeSpies.length).toBeGreaterThanOrEqual(1);
    });
    expect(disposeSpies.every(spy => spy.mock.calls.length === 0)).toBe(true);

    act(() => {
      useUserStore.setState({ token: 'valid-token' });
      useAuthStore.getState().setAuthMenuList([{ path: '/home/index', meta: { title: '首页' } }]);
    });

    await waitFor(() => {
      expect(disposeSpies.filter(spy => spy.mock.calls.length === 1)).toHaveLength(1);
    });
  });
});
