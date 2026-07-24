import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import ComponentError from '@/components/Error/ComponentError';
import LazyComponent from '@/components/Lazy';
import LayoutIndex from '@/layouts';
import { getFlatMenuList } from '@/utils';
import { type RouteObjectType } from '../interface';
import RouterGuard from './RouterGuard';

/** views 懒加载映射（排除 login） */
const modules = import.meta.glob(['@/views/**/*.tsx', '!@/views/login/**']) as Record<string, Parameters<typeof lazy>[number]>;

/** 权限菜单 → react-router 路由 */
export const convertToDynamicRouterFormat = (authMenuList: RouteObjectType[]) => {
  const flatMenuList = getFlatMenuList(authMenuList);

  const handleMenuList = flatMenuList.map(item => {
    item.children && delete item.children;

    if (item.redirect) item.element = <Navigate to={item.redirect} />;

    if (item.element && typeof item.element == 'string') {
      const loader = modules['/src/views' + item.element + '.tsx'];
      // 视图缺失时兜底，避免 lazy(undefined) 白屏
      const Component = loader ? LazyComponent(lazy(loader)) : <ComponentError element={item.element} />;
      item.element = <RouterGuard>{Component}</RouterGuard>;
    }

    item.loader = () => {
      return { ...item.meta, redirect: !!item.redirect };
    };
    return item;
  });

  const dynamicRouter: RouteObjectType[] = [{ element: <LayoutIndex />, children: [] }];

  handleMenuList.forEach(item => {
    if (item.meta?.isFull) dynamicRouter.push(item);
    else dynamicRouter[0].children?.push(item);
  });

  return dynamicRouter;
};
