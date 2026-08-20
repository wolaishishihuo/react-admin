/**
 * 授权导航构建层：后端菜单只提供授权数据，本地 route tree 决定实际可访问页面。
 * 求交后统一派生可见菜单、授权路径、路径索引和按钮权限索引。
 */
import type { QueryClient } from '@tanstack/react-query';
import type { AnyRouter } from '@tanstack/react-router';
import { getToken } from '@/stores/modules/session.store';
import { getAuthMenuListApi } from './api';
import { normalizeBackendMenu, normalizePath } from './menu-normalize';
import {
  createAuthorizedPathSet,
  createMenuPathMap,
  createPermissionMap,
  filterVisibleMenu,
  intersectMenuWithRoutes
} from './menu-tree';
import type { AuthorizedNavigation } from './types';

interface WalkableRoute {
  fullPath?: string;
  children?: unknown[];
  staticData?: { activeMenu?: string };
  options?: { staticData?: { activeMenu?: string } };
}

function getRouteStaticData(route: WalkableRoute) {
  return route.staticData ?? route.options?.staticData;
}

export function collectRouteCatalog(router: AnyRouter): Set<string> {
  const paths = new Set<string>();
  const activeMenus: Array<{ path: string; activeMenu: string }> = [];

  const walk = (route: WalkableRoute) => {
    if (route.fullPath) {
      const path = normalizePath(String(route.fullPath).split('?')[0] ?? '');
      if (path && path !== '/') paths.add(path);
      const activeMenu = getRouteStaticData(route)?.activeMenu;
      if (activeMenu) activeMenus.push({ path, activeMenu: normalizePath(activeMenu) });
    }
    if (Array.isArray(route.children)) {
      for (const child of route.children) walk(child as WalkableRoute);
    }
  };

  walk(router.routeTree as WalkableRoute);

  if (import.meta.env.DEV) {
    for (const item of activeMenus) {
      if (!paths.has(item.activeMenu)) {
        console.warn('[navigation] staticData.activeMenu 不在本地 catalog', item);
      }
    }
  }

  return paths;
}

export function buildAuthorizedNavigation(
  backend: Parameters<typeof normalizeBackendMenu>[0],
  catalog: Set<string>
): AuthorizedNavigation {
  // 先删除本地不存在的后端菜单，后续消费者共享同一棵已授权导航树。
  const tree = intersectMenuWithRoutes(normalizeBackendMenu(backend), catalog);
  return {
    tree,
    visibleTree: filterVisibleMenu(tree),
    pathSet: createAuthorizedPathSet(tree, catalog),
    pathMap: createMenuPathMap(tree),
    permissionMap: createPermissionMap(tree)
  };
}

export function navigationQueryKey(token: string = getToken()) {
  return ['navigation', 'menu', token] as const;
}

export function navigationQueryOptions(router: AnyRouter, token: string = getToken()) {
  return {
    queryKey: navigationQueryKey(token),
    queryFn: async (): Promise<AuthorizedNavigation> => {
      const backend = await getAuthMenuListApi();
      return buildAuthorizedNavigation(backend, collectRouteCatalog(router));
    },
    staleTime: Infinity
  };
}

export async function ensureAuthorizedNavigation(queryClient: QueryClient, router: AnyRouter) {
  return queryClient.ensureQueryData(navigationQueryOptions(router));
}
