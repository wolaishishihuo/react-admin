/**
 * 后台路由守卫：完成会话初始化、菜单授权、外链分流以及 403/404 判定。
 */
import { notFound, redirect } from '@tanstack/react-router';
import { HOME_PATH, LOGIN_PATH, normalizePath } from '@/features/navigation/menu-normalize';
import { collectRouteCatalog } from '@/features/navigation/menu-query';
import { isSafeRedirect } from '@/router/safe-redirect';
import { getOriginPathFromMatches } from '@/router/use-route';
import { isHttpUrl, openExternal } from '@/utils/url';
import type { AppRouterContext } from './context';
import { getRouter } from './router-ref';

interface GuardLocation {
  pathname: string;
  href: string;
  searchStr: string;
}

export function loginRedirectSearch(location: GuardLocation) {
  if (normalizePath(location.pathname) === HOME_PATH && !location.searchStr) return {};
  const redirectPath = `${normalizePath(location.pathname)}${location.searchStr}`;
  if (!isSafeRedirect(redirectPath) || redirectPath === HOME_PATH) return {};
  return { redirect: redirectPath };
}

export async function guardAdminRoute(options: {
  context: AppRouterContext;
  location: GuardLocation;
  matches?: Array<{ fullPath?: string }>;
  preload?: boolean;
}) {
  const { context, location, matches = [], preload } = options;

  if (!context.auth.isLoggedIn) {
    throw redirect({ to: LOGIN_PATH, search: loginRedirectSearch(location), replace: true });
  }

  const user = context.auth.isInitialized && context.auth.user ? context.auth.user : await context.auth.initialize();
  if (!user) {
    await context.auth.revoke();
    throw redirect({ to: LOGIN_PATH, search: loginRedirectSearch(location), replace: true });
  }

  const navigation = await context.navigation.ensureMenu();
  // 授权 identity 使用路由模板 fullPath，动态参数页面不会被具体 pathname 拆成不同权限项。
  const originPath = getOriginPathFromMatches(matches);

  const menuItem = navigation.pathMap.get(originPath);
  if (menuItem?.external) {
    if (!preload && isHttpUrl(menuItem.external)) openExternal(menuItem.external);
    throw redirect({ to: HOME_PATH, replace: true });
  }

  if (!navigation.pathSet.has(originPath)) {
    // 本地路由存在但菜单未授权是 403；本地 catalog 也不存在才是未知 URL。
    if (collectRouteCatalog(getRouter()).has(originPath)) {
      throw redirect({ to: '/403', replace: true });
    }
    throw notFound();
  }
}

export { HOME_PATH, LOGIN_PATH };
