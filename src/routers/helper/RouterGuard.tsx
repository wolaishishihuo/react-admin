import type React from 'react';
import { useEffect } from 'react';
import { useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { HOME_URL, LOGIN_URL, ROUTER_WHITE_LIST } from '@/config';
import { type MetaProps } from '@/routers/interface';
import { useUserStore, useAuthStore } from '@/stores';

/** 路由守卫：登录态重定向 + document.title + window.$navigate */
interface RouterGuardProps {
  children: React.ReactNode;
}

const RouterGuard: React.FC<RouterGuardProps> = props => {
  const loader = useLoaderData();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  window.$navigate = navigate;

  const token = useUserStore(state => state.token);
  const authMenuList = useAuthStore(state => state.authMenuList);

  useEffect(() => {
    const meta = loader as MetaProps;
    if (meta) {
      const title = import.meta.env.VITE_GLOB_APP_TITLE;
      document.title = meta?.title ? `${meta.title} - ${title}` : title;
    }

    if (ROUTER_WHITE_LIST.includes(pathname)) return;

    const isLoginPage = pathname === LOGIN_URL;

    // 已登录访问登录页 → 首页（replace 不进历史栈）
    if (authMenuList.length && token && isLoginPage) {
      navigate(HOME_URL, { replace: true });
      return;
    }

    if (!token && !isLoginPage) {
      navigate(LOGIN_URL, { replace: true });
      return;
    }
  }, [loader]);

  return props.children;
};

export default RouterGuard;
