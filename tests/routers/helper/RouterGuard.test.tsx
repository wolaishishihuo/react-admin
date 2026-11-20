import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useMemo, useRef } from 'react';
import { createMemoryRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthSession } from '@/apis/http';
import { createQueryClient } from '@/apis/query';
import { LOGIN_URL } from '@/config';
import RouterGuard from '@/routers/helper/RouterGuard';
import { useAuthStore, useTabsStore, useUserStore } from '@/stores';

function renderGuardedApp(options: { initialPath: string; fetchHome: () => Promise<{ total: number }> }) {
  const { initialPath, fetchHome } = options;
  const queryClient = createQueryClient();

  const HomePage = () => {
    const authButtons = useAuthStore(state => state.authButtons);
    const { data } = useQuery({
      queryKey: ['home', 'stats'],
      queryFn: fetchHome
    });
    return (
      <div>
        <span>home-page</span>
        <span>{data ? `total:${data.total}` : 'loading'}</span>
        <span>buttons:{authButtons.length}</span>
      </div>
    );
  };

  const SessionCacheBoundary = () => {
    const token = useUserStore(state => state.token);
    const prevTokenRef = useRef(token);

    useEffect(() => {
      if (prevTokenRef.current && !token) {
        queryClient.clear();
      }
      prevTokenRef.current = token;
    }, [token]);

    const router = useMemo(
      () =>
        createMemoryRouter(
          [
            {
              path: LOGIN_URL,
              hydrateFallbackElement: <div />,
              loader: () => ({ title: '登录' }),
              element: (
                <RouterGuard>
                  <div>login-page</div>
                </RouterGuard>
              )
            },
            {
              path: '/home/index',
              hydrateFallbackElement: <div />,
              loader: () => ({ title: '首页' }),
              element: (
                <RouterGuard>
                  <HomePage />
                </RouterGuard>
              )
            }
          ],
          { initialEntries: [initialPath] }
        ),
      []
    );

    return <ReactRouterProvider router={router} />;
  };

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <SessionCacheBoundary />
    </QueryClientProvider>
  );

  return { ...utils, queryClient };
}

describe('RouterGuard & logout Query lifecycle', () => {
  beforeEach(() => {
    useUserStore.setState({ token: '', refreshToken: '' });
    useAuthStore.setState({ authMenuList: [], flatMenuList: [], showMenuList: [], authButtons: [] });
    useTabsStore.setState({ tabsList: [] });
  });

  it('blocks protected route synchronously when unauthenticated so useQuery never fires', async () => {
    const fetchHome = vi.fn(async () => ({ total: 42 }));

    renderGuardedApp({ initialPath: '/home/index', fetchHome });

    expect(await screen.findByText('login-page')).toBeInTheDocument();
    expect(screen.queryByText('home-page')).not.toBeInTheDocument();
    expect(fetchHome).not.toHaveBeenCalled();
  });

  it('does not re-fetch mounted home query when logging out and clears Query cache after unmount', async () => {
    useUserStore.setState({ token: 'valid-token', refreshToken: 'valid-refresh' });
    useAuthStore.setState({
      authMenuList: [{ path: '/home/index' }],
      flatMenuList: [{ path: '/home/index' }],
      showMenuList: [{ path: '/home/index' }],
      authButtons: ['sys:user:create']
    });

    const fetchHome = vi.fn(async () => ({ total: 99 }));
    const { queryClient } = renderGuardedApp({ initialPath: '/home/index', fetchHome });

    expect(await screen.findByText('total:99')).toBeInTheDocument();
    expect(fetchHome).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(1);

    act(() => {
      clearAuthSession();
    });

    await waitFor(() => {
      expect(screen.getByText('login-page')).toBeInTheDocument();
    });

    // Mounted home page unmounted synchronously before cache clear — zero extra calls, zero 401s
    expect(fetchHome).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });
});
