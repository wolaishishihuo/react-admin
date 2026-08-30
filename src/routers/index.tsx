import { useEffect, useMemo, useState } from 'react';
import { createBrowserRouter, createHashRouter, RouteObject, RouterProvider as Router } from 'react-router-dom';

import NotFound from '@/components/Error/404';
import { Loading } from '@/components/Loading';
import { LOGIN_URL } from '@/config';
import { RouterModeEnum } from '@/constants';
import useMessage from '@/hooks/useMessage';
import usePermissions from '@/hooks/usePermissions';
import useTheme from '@/hooks/useTheme';
import { useAuthStore, useUserStore } from '@/stores';

import { convertToDynamicRouterFormat } from './helper/ConvertRouter';
import RouterGuard from './helper/RouterGuard';
import { wrappedStaticRouter } from './modules/staticRouter';

const mode = import.meta.env.VITE_ROUTER_MODE;

const PUBLIC_PATHS = new Set([LOGIN_URL, '/403', '/404', '/500', '/']);

const getLocationPath = () => {
  if (mode === RouterModeEnum.HASH) {
    const hash = window.location.hash.replace(/^#/, '');
    return (hash || '/').split('?')[0] || '/';
  }
  return window.location.pathname;
};

const createAppRouter = (routerList: RouteObject[]) => {
  const routes: RouteObject[] = [
    {
      hydrateFallbackElement: <Loading />,
      children: routerList
    }
  ];
  return mode === RouterModeEnum.HASH ? createHashRouter(routes) : createBrowserRouter(routes);
};

/**
 * @description Route file entry
 */
const RouterProvider: React.FC = () => {
  // useTheme && useMessage
  useTheme();
  useMessage();

  const { initPermissions } = usePermissions();

  const token = useUserStore(state => state.token);
  const authMenuList = useAuthStore(state => state.authMenuList);
  const [pathname, setPathname] = useState(getLocationPath);

  useEffect(() => {
    if (token && !authMenuList.length) {
      initPermissions(token);
    }
  }, [authMenuList, token]);

  // Keep the static router while still on /login so hydrating menus does not remount the login page
  const useFullRouter = authMenuList.length > 0 && pathname !== LOGIN_URL;

  const routerList = useMemo(() => {
    if (!useFullRouter) return wrappedStaticRouter;

    const dynamicRouter = convertToDynamicRouterFormat(authMenuList);
    const staticRouter = wrappedStaticRouter.map(route =>
      route.path === '*'
        ? {
            ...route,
            element: (
              <RouterGuard>
                <NotFound />
              </RouterGuard>
            )
          }
        : route
    );

    return [...staticRouter, ...dynamicRouter];
  }, [useFullRouter, authMenuList]);

  const router = useMemo(() => createAppRouter(routerList as RouteObject[]), [routerList]);

  useEffect(() => {
    return router.subscribe(() => {
      setPathname(prev => {
        const next = getLocationPath();
        return prev === next ? prev : next;
      });
    });
  }, [router]);

  // Menu routes are not persisted; wait before matching protected URLs so RR7 does not flash the 404 page
  const waitingAuthRoutes = Boolean(token) && !authMenuList.length && !PUBLIC_PATHS.has(getLocationPath());
  if (waitingAuthRoutes) return <Loading />;

  return <Router router={router} />;
};

export default RouterProvider;
