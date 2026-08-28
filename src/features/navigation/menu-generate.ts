/**
 * 从本地 (admin) 文件树生成侧边栏。
 * 没有 staticData 的节点不是菜单项，也不会把子路由提到上一级——分组必须自己写 layout 并声明 title。
 */
import type { RouteMeta } from '@/router/context';
import type { AnyRouter } from '@tanstack/react-router';
import { toHttpUrl } from '@/utils/url';
import { normalizePath } from './menu-normalize';
import { createAuthorizedPathSet, createMenuPathMap, createPermissionMap, filterVisibleMenu } from './menu-tree';
import type { AuthorizedNavigation, NavigationItem } from './types';

interface WalkableRoute {
  id?: string;
  fullPath?: string;
  children?: unknown;
  staticData?: RouteMeta;
  options?: { staticData?: RouteMeta };
}

const ADMIN_LAYOUT_ID = '/(admin)';

function getRouteStaticData(route: WalkableRoute) {
  return route.staticData ?? route.options?.staticData;
}

function getRouteChildren(route: WalkableRoute): WalkableRoute[] {
  const children = route.children;
  if (Array.isArray(children)) return children as WalkableRoute[];
  if (children && typeof children === 'object') return Object.values(children) as WalkableRoute[];
  return [];
}

function findAdminLayout(route: WalkableRoute): WalkableRoute | null {
  if (route.id === ADMIN_LAYOUT_ID) return route;
  for (const child of getRouteChildren(route)) {
    const hit = findAdminLayout(child);
    if (hit) return hit;
  }
  return null;
}

function sortMenus(items: NavigationItem[]) {
  return items.toSorted((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function transformStaticRouteToMenu(route: WalkableRoute): NavigationItem | null {
  const staticData = getRouteStaticData(route);
  if (!staticData) return null;

  const path = route.fullPath ? normalizePath(String(route.fullPath)) : '';
  if (!path || path === '/') return null;

  const activeMenu = staticData.menu?.activeMenu?.trim();
  const href = toHttpUrl(staticData.href);
  const iframe = toHttpUrl(staticData.url);
  const childMenus = generateStaticChildMenus(route);

  return {
    id: path,
    path,
    title: (staticData.title ?? '').trim(),
    icon: staticData.menu?.icon,
    hidden: Boolean(staticData.menu?.hide),
    fixed: Boolean(staticData.tab?.fixed),
    keepAlive: staticData.keepAlive,
    multi: staticData.tab?.multi ?? undefined,
    activeMenu: activeMenu ? normalizePath(activeMenu) : undefined,
    order: staticData.menu?.order ?? undefined,
    external: href,
    iframe,
    permissions: staticData.buttons ?? [],
    children: childMenus
  };
}

function generateStaticChildMenus(route: WalkableRoute) {
  const childMenus: NavigationItem[] = [];
  for (const childRoute of getRouteChildren(route)) {
    const childMenu = transformStaticRouteToMenu(childRoute);
    if (childMenu) childMenus.push(childMenu);
  }
  return sortMenus(childMenus);
}

export function generateStaticNavigation(router: AnyRouter): AuthorizedNavigation {
  const adminLayout = findAdminLayout(router.routeTree as WalkableRoute);
  const tree = sortMenus(
    getRouteChildren(adminLayout ?? {})
      .map(transformStaticRouteToMenu)
      .filter((item): item is NavigationItem => item !== null)
  );

  return {
    tree,
    visibleTree: filterVisibleMenu(tree),
    pathSet: createAuthorizedPathSet(tree),
    pathMap: createMenuPathMap(tree),
    permissionMap: createPermissionMap(tree)
  };
}
