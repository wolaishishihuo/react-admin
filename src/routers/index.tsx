import { useCallback, useMemo, useEffect, useState } from 'react';
import { RouterProvider as Router, type RouteObject, createHashRouter, createBrowserRouter } from 'react-router-dom';
import NotFound from '@/components/Error/404';
import MenuLoadError from '@/components/Error/MenuLoadError';
import { Loading } from '@/components/Loading';
import useDelayedVisible from '@/hooks/useDelayedVisible';
import useMessage from '@/hooks/useMessage';
import useTheme from '@/hooks/useTheme';
import { useUserStore, useAuthStore } from '@/stores';
import { initPermissions } from '@/utils/auth';
import { convertToDynamicRouterFormat } from './helper/ConvertRouter';
import { type RouteObjectType } from './interface';
import { wrappedStaticRouter } from './modules/staticRouter';

const mode = import.meta.env.VITE_ROUTER_MODE;

/** 路由入口：静态路由 + 后端菜单生成的动态路由 */
const RouterProvider: React.FC = () => {
  useTheme();
  useMessage();

  const token = useUserStore(state => state.token);
  const authMenuList = useAuthStore(state => state.authMenuList);
  const [menuError, setMenuError] = useState(false);

  // 失败后 token 仍在 = 请求失败，显示重试；token 已被 clearAuth 清空 = 会话失效，交守卫跳登录
  const runInit = useCallback(() => {
    setMenuError(false);
    initPermissions(token).catch(() => {
      if (useUserStore.getState().token) setMenuError(true);
    });
  }, [token]);

  // 已登录无菜单时拉权限
  useEffect(() => {
    if (token && !authMenuList.length) runInit();
  }, [authMenuList, token]);

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

  const ready = !token || authMenuList.length > 0;
  const showLoading = useDelayedVisible(!ready);

  // 菜单失败且 token 仍在：重试视图
  if (token && !authMenuList.length && menuError) return <MenuLoadError onRetry={runInit} />;

  // 权限就绪前不渲染业务内容；loading 防闪烁，快后端下不会一闪而过
  if (showLoading) return <Loading />;
  if (!ready) return null;

  return <Router router={router} />;
};

export default RouterProvider;
