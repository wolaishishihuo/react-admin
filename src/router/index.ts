/**
 * 应用 Router 单例：装配文件路由树、history 模式与 URL search 规则。
 * 组件外导航和缓存快照都以该单例为基础。
 */
import { createBrowserHistory, createHashHistory, createRouter } from '@tanstack/react-router';
import { initialRouterContext, type RouteMeta } from './context';
import { setRouter } from './router-ref';
import { routeTree } from './routeTree.gen';

function createAppHistory(mode: string) {
  return mode === 'hash' ? createHashHistory() : createBrowserHistory();
}

/** 使用 URLSearchParams，避免默认 JSON search 把 id=1 序列化成 id=%221%22 */
function parseSearch(searchStr: string): Record<string, string> {
  const normalized = searchStr.startsWith('?') ? searchStr.slice(1) : searchStr;
  return Object.fromEntries(new URLSearchParams(normalized).entries());
}

function stringifySearch(search: Record<string, unknown>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const router = createRouter({
  routeTree,
  context: initialRouterContext,
  history: createAppHistory(import.meta.env.VITE_ROUTER_MODE),
  parseSearch,
  stringifySearch,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 10,
  defaultPendingMinMs: 1000,
  defaultStructuralSharing: true,
  notFoundMode: 'root',
  scrollRestoration: true,
  trailingSlash: 'never'
});

setRouter(router);

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  interface StaticDataRouteOption extends RouteMeta {}
}
