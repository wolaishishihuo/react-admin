import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LayoutTabs from '@/layouts/components/Tabs';
import type { RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore, useTabsStore } from '@/stores';

const FLAT_MENU: RouteObjectType[] = [
  {
    path: '/home/index',
    meta: { title: '首页', icon: 'ri:home-smile-2-line', isAffix: true, isHide: false, isFull: false }
  },
  {
    path: '/system/accountManage',
    meta: { title: '账号管理', icon: 'ri:apps-2-line', isAffix: false, isHide: false, isFull: false }
  }
];

describe('LayoutTabs', () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView;

  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    useGlobalStore.setState({ tabs: true, tabsIcon: false });
    useAuthStore.setState({ flatMenuList: FLAT_MENU });
    useTabsStore.setState({ tabsList: [] });
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('adds both affixed tabs and the current deep-link route on cold mount', async () => {
    const router = createMemoryRouter(
      [
        {
          hydrateFallbackElement: <div />,
          element: <LayoutTabs />,
          children: [
            {
              path: '/system/accountManage',
              loader: () => ({ title: '账号管理', icon: 'ri:apps-2-line', isAffix: false, redirect: false }),
              element: <div>account-page</div>
            }
          ]
        }
      ],
      { initialEntries: ['/system/accountManage?id=42'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(useTabsStore.getState().tabsList.map(item => item.path)).toEqual(['/home/index', '/system/accountManage?id=42']);
    });

    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('账号管理')).toBeInTheDocument();
    router.dispose();
  });

  it('ignores redirect routes and routes without meta without throwing', async () => {
    const router = createMemoryRouter(
      [
        {
          hydrateFallbackElement: <div />,
          element: <LayoutTabs />,
          children: [
            {
              path: '/no-meta',
              element: <div>no-meta</div>
            },
            {
              path: '/redirect-only',
              loader: () => ({ title: '重定向页', redirect: true }),
              element: <div>redirect</div>
            }
          ]
        }
      ],
      { initialEntries: ['/no-meta'] }
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(useTabsStore.getState().tabsList.map(item => item.path)).toEqual(['/home/index']);
    });

    await router.navigate('/redirect-only');

    await waitFor(() => {
      expect(useTabsStore.getState().tabsList.map(item => item.path)).toEqual(['/home/index']);
    });

    router.dispose();
  });
});
