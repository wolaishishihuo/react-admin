import { render, screen } from '@testing-library/react';
import {
  Outlet,
  RouterContextProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useRouter
} from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { createSnapshotRouter, type RouterStateSnapshot } from '@/layouts/cache/snapshot-router';
import type { AnyRouter } from '@tanstack/react-router';

function Probe() {
  const router = useRouter();
  const state = router.state as {
    location: { pathname: string };
    matches: Array<{ search?: { tab?: string }; params?: { userId?: string } }>;
  };
  const current = state.matches.at(-1);
  return (
    <div>
      <span data-testid='pathname'>{state.location.pathname}</span>
      <span data-testid='search'>{current?.search?.tab ?? ''}</span>
      <span data-testid='param'>{current?.params?.userId ?? ''}</span>
    </div>
  );
}

function createTestRouter(initial: string) {
  const rootRoute = createRootRoute({
    component: () => <Outlet />
  });
  const userRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users/$userId',
    validateSearch: (search: Record<string, unknown>) => ({ tab: String(search.tab ?? '') }),
    component: Probe
  });
  const history = createMemoryHistory({ initialEntries: [initial] });
  return createRouter({
    routeTree: rootRoute.addChildren([userRoute]),
    history
  });
}

describe('createSnapshotRouter', () => {
  it('只改克隆实例的 __store 与 latestLocation', () => {
    const location = { href: '/list/useProTable/detail?id=1', pathname: '/list/useProTable/detail' };
    const originalStore = { state: { location: { href: '/home' } } };
    const router = Object.assign(Object.create({}), {
      __store: originalStore,
      latestLocation: { href: '/home' }
    }) as unknown as AnyRouter;

    const routeState = { location } as unknown as RouterStateSnapshot;
    const snapshot = createSnapshotRouter(router, routeState);

    expect(snapshot).not.toBe(router);
    expect((snapshot as unknown as { latestLocation: { href: string } }).latestLocation.href).toBe(
      '/list/useProTable/detail?id=1'
    );
    expect((router as unknown as { latestLocation: { href: string } }).latestLocation.href).toBe('/home');
    expect((snapshot as unknown as { __store: { state: RouterStateSnapshot } }).__store.state).toBe(routeState);
  });

  it('真实 Router hooks 读取 snapshot 的 location/search/params，且不污染 live __store', async () => {
    const router = createTestRouter('/users/1?tab=profile');
    await router.load();
    const liveStore = (router as unknown as { __store: unknown }).__store;
    const snapshotState = router.state as unknown as RouterStateSnapshot;

    await router.navigate({ href: '/users/2?tab=other' });
    await router.load();

    const snapshotRouter = createSnapshotRouter(router, snapshotState);
    render(
      <RouterContextProvider router={snapshotRouter}>
        <Probe />
      </RouterContextProvider>
    );
    expect(screen.getByTestId('pathname').textContent).toBe('/users/1');
    expect(screen.getByTestId('search').textContent).toBe('profile');
    expect(screen.getByTestId('param').textContent).toBe('1');
    expect((router as unknown as { __store: unknown }).__store).toBe(liveStore);
    expect(router.state.location.pathname).toBe('/users/2');
  });
});
