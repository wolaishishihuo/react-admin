/**
 * 授权导航构建层：static 读本地文件树；dynamic 拉当前账号菜单后再按本地文件裁一遍。
 */
import type { QueryClient } from '@tanstack/react-query';
import type { AnyRouter } from '@tanstack/react-router';
import { getSessionEpoch } from '@/stores/modules/session.store';
import { AUTH_ROUTE_MODE } from './route-mode';
import { getAuthMenuListApi } from './api';
import { normalizeBackendRouteResponse } from './dynamic-routes';
import { generateStaticNavigation } from './menu-generate';
import { createAuthorizedPathSet, createMenuPathMap, createPermissionMap, filterVisibleMenu } from './menu-tree';
import type { AuthorizedNavigation, BackendRoutePayload, BackendRouteResponse } from './types';

export function buildAuthorizedNavigation(
  backend: BackendRouteResponse | BackendRoutePayload[],
  routeTree: AnyRouter['routeTree']
): AuthorizedNavigation {
  const tree = normalizeBackendRouteResponse(backend, routeTree);
  return {
    tree,
    visibleTree: filterVisibleMenu(tree),
    pathSet: createAuthorizedPathSet(tree),
    pathMap: createMenuPathMap(tree),
    permissionMap: createPermissionMap(tree)
  };
}

export function navigationQueryKey(sessionEpoch: number = getSessionEpoch()) {
  return ['navigation', 'menu', sessionEpoch, AUTH_ROUTE_MODE] as const;
}

export function navigationQueryOptions(router: AnyRouter, sessionEpoch: number = getSessionEpoch()) {
  return {
    queryKey: navigationQueryKey(sessionEpoch),
    queryFn: async (): Promise<AuthorizedNavigation> => {
      if (AUTH_ROUTE_MODE !== 'dynamic') {
        return generateStaticNavigation(router);
      }
      const backend = await getAuthMenuListApi();
      return buildAuthorizedNavigation(backend, router.routeTree);
    },
    staleTime: Infinity
  };
}

export async function ensureAuthorizedNavigation(queryClient: QueryClient, router: AnyRouter) {
  return queryClient.ensureQueryData(navigationQueryOptions(router));
}

export { collectAvailableRoutePaths, hasAuthorizedRoutePath } from './dynamic-routes';
export type { BackendRouteResponse };
