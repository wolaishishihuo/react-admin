/** 组件入口：读授权导航树，以及侧边栏当前选中 path。 */
import { useQuery } from '@tanstack/react-query';
import { getRouter } from '@/router/router-ref';
import { getMenuSelectPath, useRoute } from '@/router/use-route';
import { useSessionStore } from '@/stores/modules/session.store';
import { navigationQueryOptions } from './menu-query';
import type { NavigationItem } from './types';

const EMPTY_ITEMS: NavigationItem[] = [];
const EMPTY_PATH_SET = new Set<string>();
const EMPTY_PATH_MAP = new Map<string, NavigationItem>();
const EMPTY_PERMISSION_MAP = new Map<string, string[]>();

export function useAuthorizedNavigation() {
  const token = useSessionStore(state => state.token);
  const sessionEpoch = useSessionStore(state => state.sessionEpoch);
  const query = useQuery({
    ...navigationQueryOptions(getRouter(), sessionEpoch),
    enabled: Boolean(token)
  });

  const tree = query.data?.tree ?? EMPTY_ITEMS;
  const visibleTree = query.data?.visibleTree ?? EMPTY_ITEMS;

  return {
    ...query,
    tree,
    visibleTree,
    pathSet: query.data?.pathSet ?? EMPTY_PATH_SET,
    pathMap: query.data?.pathMap ?? EMPTY_PATH_MAP,
    permissionMap: query.data?.permissionMap ?? EMPTY_PERMISSION_MAP
  };
}

export function useMenuSelectPath() {
  const route = useRoute();
  const { pathMap } = useAuthorizedNavigation();
  return getMenuSelectPath(route, pathMap.get(route.originPath)?.activeMenu);
}
