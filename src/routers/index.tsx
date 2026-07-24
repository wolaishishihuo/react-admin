import { useMemo, useEffect, useState } from 'react';
import { RouterProvider as Router, type RouteObject, createHashRouter, createBrowserRouter } from 'react-router-dom';
import NotFound from '@/components/Error/404';
import MenuLoadError from '@/components/Error/MenuLoadError';
import { Loading } from '@/components/Loading';
import useMessage from '@/hooks/useMessage';
import usePermissions from '@/hooks/usePermissions';
import useTheme from '@/hooks/useTheme';
import { useUserStore, useAuthStore } from '@/stores';
import { convertToDynamicRouterFormat } from './helper/ConvertRouter';
import { type RouteObjectType } from './interface';
import { wrappedStaticRouter } from './modules/staticRouter';

const mode = import.meta.env.VITE_ROUTER_MODE;

/** 路由入口：静态路由 + 后端菜单生成的动态路由 */
const RouterProvider: React.FC = () => {
  useTheme();
  useMessage();

  const { initPermissions } = usePermissions();

  const token = useUserStore(state => state.token);
  const authMenuList = useAuthStore(state => state.authMenuList);
  const [menuError, setMenuError] = useState(false);

  // 已登录无菜单时拉权限；reject 且 token 仍在=请求失败
  useEffect(() => {
    if (token && !authMenuList.length) {
      setMenuError(false);
      initPermissions(token).catch(() => {
        if (useUserStore.getState().token) setMenuError(true);
      });
    }
  }, [authMenuList, token]);

  const handleRetry = () => {
    setMenuError(false);
    initPermissions(token).catch(() => {
      if (useUserStore.getState().token) setMenuError(true);
    });
  };

  // 路由表仅随 authMenuList 变，token 续期不重建
  const routerList = useMemo<RouteObjectType[]>(() => {
    if (!authMenuList.length) return wrappedStaticRouter;
    const staticPart = wrappedStaticRouter.map(route => (route.path === '*' ? { ...route, element: <NotFound /> } : route));
    return [...staticPart, ...convertToDynamicRouterFormat(authMenuList)];
  }, [authMenuList]);

  const router = useMemo(() => {
    const routes: RouteObject[] = [{ HydrateFallback: Loading, children: routerList as RouteObject[] }];
    return mode === 'hash' ? createHashRouter(routes) : createBrowserRouter(routes);
  }, [routerList]);

  // 菜单失败且 token 仍在：重试视图
  if (token && !authMenuList.length && menuError) return <MenuLoadError onRetry={handleRetry} />;

  const ready = !token || authMenuList.length > 0;
  if (!ready) return <Loading />;

  return <Router router={router} />;
};

export default RouterProvider;
