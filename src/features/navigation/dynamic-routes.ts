/**
 * 把后端菜单裁成本地真正存在的路由。
 * path 对不上本地文件时，这一项连同它的 children 一起丢掉，避免侧边栏出现点了 404 的空菜单。
 */
import type { AnyRoute } from '@tanstack/react-router';
import { isHttpUrl } from '@/utils/url';
import { normalizePath, toTanStackRoutePath, unwrapBackendRoutes } from './menu-normalize';
import type { AuthRouteMode } from './route-mode';
import type { AuthorizedNavigation, BackendRoutePayload, BackendRouteResponse, NavigationItem } from './types';

interface WalkableRoute {
  fullPath?: string;
  children?: unknown;
}

function getRouteChildren(route: WalkableRoute): WalkableRoute[] {
  const children = route.children;
  if (Array.isArray(children)) return children as WalkableRoute[];
  // createRouter 之后 children 是数组；生成前的 file children 可能是对象
  if (children && typeof children === 'object') return Object.values(children) as WalkableRoute[];
  return [];
}

function warn(message: string, extra?: unknown) {
  if (import.meta.env.DEV) console.warn(`[navigation] ${message}`, extra ?? '');
}

function toExternal(link?: string | null) {
  if (!link?.trim()) return undefined;
  const trimmed = link.trim();
  if (!isHttpUrl(trimmed)) {
    warn('非法 href，已丢弃', trimmed);
    return undefined;
  }
  return trimmed;
}

/** 本地文件路由里所有规范化后的 path，用作 dynamic 裁菜单的白名单。 */
export function collectAvailableRoutePaths(route: AnyRoute | WalkableRoute) {
  const paths = new Set<string>();

  const walk = (currentRoute: WalkableRoute) => {
    const fullPath = currentRoute.fullPath ? normalizePath(String(currentRoute.fullPath)) : '';
    if (fullPath) paths.add(fullPath);
    for (const child of getRouteChildren(currentRoute)) walk(child);
  };

  walk(route);
  return paths;
}

function isNavigationItem(item: NavigationItem | null): item is NavigationItem {
  return item !== null;
}

export function createBackendRouteNormalizer(routeTree: AnyRoute | WalkableRoute) {
  const availableRoutePaths = collectAvailableRoutePaths(routeTree);

  function toAvailableRoutePath(path?: string | null) {
    if (!path) return undefined;
    const routePath = toTanStackRoutePath(path);
    return availableRoutePaths.has(routePath) ? routePath : undefined;
  }

  function toBackendRoute(route: BackendRoutePayload): NavigationItem | null {
    const path = toTanStackRoutePath(route.path);
    if (!availableRoutePaths.has(path)) return null;

    const handle = route.handle ?? route.meta ?? {};
    if (route.element) warn('忽略后端 element，页面由本地 route tree 决定', { path, element: route.element });

    const children = route.children?.map(toBackendRoute).filter(isNavigationItem) ?? [];
    const title = (handle.title ?? route.name ?? '').trim();

    return {
      id: String(route.id ?? route.name ?? path),
      path,
      title,
      icon: handle.icon ?? undefined,
      hidden: Boolean(handle.hideInMenu),
      fixed: handle.fixedIndexInTab != null,
      keepAlive: handle.keepAlive,
      multi: handle.multiTab ?? undefined,
      activeMenu: toAvailableRoutePath(handle.activeMenu),
      order: handle.order ?? undefined,
      external: toExternal(handle.href),
      permissions: handle.buttons ?? [],
      children
    };
  }

  return function normalizeRouteResponse(routeData: BackendRouteResponse | BackendRoutePayload[]) {
    return unwrapBackendRoutes(routeData).map(toBackendRoute).filter(isNavigationItem);
  };
}

export function normalizeBackendRouteResponse(
  routeData: BackendRouteResponse | BackendRoutePayload[],
  routeTree: AnyRoute | WalkableRoute
) {
  return createBackendRouteNormalizer(routeTree)(routeData);
}

/** static 不看这份菜单；dynamic 只有当前账号菜单里出现过的 path 才放行。 */
export function hasAuthorizedRoutePath(
  path: string,
  navigation: Pick<AuthorizedNavigation, 'pathMap'>,
  routeMode: AuthRouteMode
) {
  if (routeMode !== 'dynamic') return true;
  return navigation.pathMap.has(path);
}
