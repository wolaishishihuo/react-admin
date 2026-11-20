import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import NotFound from '@/components/Error/404';
import LazyComponent from '@/components/Lazy';
import LayoutIndex from '@/layouts';
import { getFlatMenuList } from '@/utils';

import { RouteObjectType } from '../interface';
import RouterGuard from './RouterGuard';

// Only match route entry files (`**/index.tsx`) so page-private components/configs stay bundled with their page
const modules = import.meta.glob(['@/views/**/index.tsx', '!@/views/login/**']) as Record<
  string,
  Parameters<typeof lazy>[number]
>;

/**
 * @description Convert menuList to the format required by react-router
 * @param {Array} authMenuList Permissions menu list
 * @returns {Array} The routing format required by the react-router
 */
export const convertToDynamicRouterFormat = (authMenuList: RouteObjectType[]) => {
  // Flat Routing
  const flatMenuList = getFlatMenuList(authMenuList);

  // Convert Routing
  const handleMenuList = flatMenuList.map(item => {
    if (item.children) delete item.children;

    // Set redirection component
    if (item.redirect) item.element = <Navigate to={item.redirect} />;

    // Convert element string to lazy route component with fallback when path is missing
    if (item.element && typeof item.element === 'string') {
      const modulePath = `/src/views${item.element}.tsx`;
      const loader = modules[modulePath];
      if (loader) {
        const Component = LazyComponent(lazy(loader));
        item.element = <RouterGuard>{Component}</RouterGuard>;
      } else {
        if (import.meta.env.DEV) {
          console.warn(`[ConvertRouter] 未找到页面组件：${modulePath}`);
        }
        item.element = (
          <RouterGuard>
            <NotFound />
          </RouterGuard>
        );
      }
    }

    // Set loader
    item.loader = () => {
      return { ...item.meta, redirect: !!item.redirect };
    };
    return item;
  });

  const dynamicRouter: RouteObjectType[] = [{ element: <LayoutIndex />, children: [] }];

  // Add to Dynamic routing
  handleMenuList.forEach(item => {
    if (item.meta?.isFull) dynamicRouter.push(item);
    else dynamicRouter[0].children?.push(item);
  });

  return dynamicRouter;
};
