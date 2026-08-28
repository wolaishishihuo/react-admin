/**
 * 后台路由守卫：完成会话初始化、菜单授权、外链分流以及 403/404 判定。
 * static：本地文件树里有这条 originPath 就放行。
 * dynamic：还要求当前账号菜单里有这条 originPath。
 */
import { notFound, redirect } from '@tanstack/react-router';
import { HOME_PATH, LOGIN_PATH, normalizePath } from '@/features/navigation/menu-normalize';
import { AUTH_ROUTE_MODE, type AuthRouteMode } from '@/features/navigation/route-mode';
import { collectAvailableRoutePaths, hasAuthorizedRoutePath } from '@/features/navigation/dynamic-routes';
import { isSafeRedirect } from '@/router/safe-redirect';
import { getOriginPathFromMatches } from '@/router/use-route';
import { isHttpUrl, openExternal } from '@/utils/url';
import type { AppRouterContext, RouteMeta } from './context';
import { getRouter } from './router-ref';

interface GuardLocation {
  pathname: string;
  href: string;
  searchStr: string;
}

interface GuardMatch {
  fullPath?: string;
  staticData?: Partial<RouteMeta>;
}

export function loginRedirectSearch(location: GuardLocation) {
  if (normalizePath(location.pathname) === HOME_PATH && !location.searchStr) return {};
  const redirectPath = `${normalizePath(location.pathname)}${location.searchStr}`;
  if (!isSafeRedirect(redirectPath) || redirectPath === HOME_PATH) return {};
  return { redirect: redirectPath };
}

/** 从后往前找带 href 的 match；分组 layout 写了 href 会带走子页。 */
function getMatchedRouteHref(matches: GuardMatch[]) {
  return matches.findLast(match => match.staticData?.href)?.staticData?.href;
}

function getRouteSwitchFallbackPath(originPath: string) {
  return originPath === HOME_PATH ? '/404' : HOME_PATH;
}

export async function guardAdminRoute(options: {
  context: AppRouterContext;
  location: GuardLocation;
  matches?: GuardMatch[];
  preload?: boolean;
  routeMode?: AuthRouteMode;
}) {
  const { context, location, matches = [], preload } = options;
  const routeMode = options.routeMode ?? AUTH_ROUTE_MODE;

  if (!context.auth.isLoggedIn) {
    throw redirect({ to: LOGIN_PATH, search: loginRedirectSearch(location), replace: true });
  }

  const user = context.auth.isInitialized && context.auth.user ? context.auth.user : await context.auth.initialize();
  if (!user) {
    await context.auth.revoke();
    throw redirect({ to: LOGIN_PATH, search: loginRedirectSearch(location), replace: true });
  }

  const originPath = getOriginPathFromMatches(matches);
  const catalog = collectAvailableRoutePaths(getRouter().routeTree);

  if (routeMode !== 'dynamic') {
    if (!catalog.has(originPath)) throw notFound();
  } else {
    const navigation = await context.navigation.ensureMenu();
    if (!hasAuthorizedRoutePath(originPath, navigation, routeMode)) {
      if (catalog.has(originPath)) {
        throw redirect({ to: '/403', replace: true });
      }
      throw notFound();
    }
  }

  const href = getMatchedRouteHref(matches);
  if (href && !preload) {
    if (isHttpUrl(href)) openExternal(href);
    throw redirect({ to: getRouteSwitchFallbackPath(originPath), replace: true });
  }
}

export { HOME_PATH, LOGIN_PATH };
