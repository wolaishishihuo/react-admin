import { cleanup, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { convertToDynamicRouterFormat } from '@/routers/helper/ConvertRouter';
import { useAuthStore, useUserStore } from '@/stores';

describe('convertToDynamicRouterFormat', () => {
  afterEach(() => {
    cleanup();
    useUserStore.getState().setToken('');
    useAuthStore.getState().setAuthMenuList([]);
    vi.restoreAllMocks();
  });

  it('falls back to NotFound instead of throwing when backend returns an unknown element path', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    useUserStore.getState().setToken('valid-token');

    const routes = convertToDynamicRouterFormat([
      {
        path: '/ghost/page',
        element: '/ghost/missing/index',
        meta: {
          key: 'ghost',
          title: '不存在的菜单',
          isFull: true
        }
      }
    ]);

    const router = createMemoryRouter(routes as RouteObject[], { initialEntries: ['/ghost/page'] });
    render(<RouterProvider router={router} />);

    expect(await screen.findByText('404')).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('/src/views/ghost/missing/index.tsx'));
  });
});
