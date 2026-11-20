import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, useLoaderData, useLocation, useNavigate } from 'react-router-dom';

import { HOME_URL, LOGIN_URL, ROUTER_WHITE_LIST } from '@/config';
import { MetaProps } from '@/routers/interface';
import { useAuthStore, useUserStore } from '@/stores';

interface RouterGuardProps {
  /** 受路由守卫保护的子节点 */
  children: ReactNode;
}

const RouterGuard = (props: RouterGuardProps) => {
  const { children } = props;
  const loader = useLoaderData();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const token = useUserStore(state => state.token);
  const authMenuList = useAuthStore(state => state.authMenuList);

  // Mount navigate to provide non-React function components or calls in custom React Hook functions
  window.$navigate = navigate;

  useEffect(() => {
    const meta = loader as MetaProps;
    if (meta) {
      const title = import.meta.env.VITE_GLOB_APP_TITLE;
      document.title = meta?.title ? `${meta.title} - ${title}` : title;
    }
  }, [loader]);

  const isWhiteListed = ROUTER_WHITE_LIST.includes(pathname);
  const isLoginPage = pathname === LOGIN_URL;

  if (!isWhiteListed) {
    if (token && authMenuList.length > 0 && isLoginPage) {
      return <Navigate to={HOME_URL} replace />;
    }

    if (!token && !isLoginPage) {
      return <Navigate to={LOGIN_URL} replace />;
    }
  }

  return children;
};

export default RouterGuard;
