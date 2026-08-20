/**
 * 统一路由身份模型：originPath 用于授权/菜单/Tabs，fullPath 用于 multi Tab 和实际导航。
 */
import { useMatches } from '@tanstack/react-router';
import { normalizePath } from '@/features/navigation/menu-normalize';
import type { RouteMeta } from './context';

export interface AppRouteIdentity {
  originPath: string;
  pathname: string;
  fullPath: string;
  staticData: Partial<RouteMeta>;
  search: Record<string, unknown>;
  params: Record<string, string>;
}

function stringifyRouteSearch(search: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getOriginPathFromMatches(matches: Array<{ fullPath?: string }>): string {
  // 最后一个 match 的 fullPath 是路由模板路径，例如 /users/$userId，而不是具体 pathname。
  const current = matches.at(-1);
  if (!current?.fullPath) return '/';
  return normalizePath(String(current.fullPath).split('?')[0] ?? '');
}

export function getMenuSelectPath(route: { originPath: string; staticData?: { activeMenu?: string } }): string {
  const activeMenu = route.staticData?.activeMenu?.trim();
  return activeMenu ? normalizePath(activeMenu) : route.originPath;
}

export function selectRouteIdentity(
  matches: Array<{
    fullPath?: string;
    pathname?: string;
    search?: unknown;
    params?: unknown;
    staticData?: Partial<RouteMeta>;
  }>
): AppRouteIdentity {
  const current = matches.at(-1);
  if (!current) {
    return { originPath: '/', pathname: '/', fullPath: '/', staticData: {}, search: {}, params: {} };
  }

  const pathname = current.pathname || '/';
  const search = (current.search ?? {}) as Record<string, unknown>;
  const qs = stringifyRouteSearch(search);

  return {
    originPath: getOriginPathFromMatches(matches),
    pathname,
    fullPath: `${pathname}${qs}`,
    staticData: current.staticData ?? {},
    search,
    params: (current.params ?? {}) as Record<string, string>
  };
}

export function useRoute(): AppRouteIdentity {
  return useMatches({
    select: selectRouteIdentity,
    structuralSharing: false
  });
}
