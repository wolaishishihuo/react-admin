import type React from 'react';
import { useEffect } from 'react';
import { Navigate, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { HOME_URL, LOGIN_URL, ROUTER_WHITE_LIST } from '@/config';
import { type MetaProps } from '@/routers/interface';
import { useUserStore, useAuthStore } from '@/stores';

/** 路由守卫：登录态重定向 + document.title + window.$navigate */
interface RouterGuardProps {
  children: React.ReactNode;
}

const RouterGuard: React.FC<RouterGuardProps> = props => {
  const meta = useLoaderData() as MetaProps;
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // 必须在首个请求发出前就绪，不能挪进 effect
  window.$navigate = navigate;

  const token = useUserStore(state => state.token);
  const authMenuList = useAuthStore(state => state.authMenuList);

  useEffect(() => {
    const title = import.meta.env.VITE_GLOB_APP_TITLE;
    document.title = meta?.title ? `${meta.title} - ${title}` : title;
  }, [meta]);

  if (ROUTER_WHITE_LIST.includes(pathname)) return props.children;

  const isLoginPage = pathname === LOGIN_URL;

  // 渲染期判定，token 变化即刻生效，不等下一次导航
  if (!token && !isLoginPage) {
    const fullPath = pathname + search;
    // 首页且无 query 时不带 redirect，避免 /login?redirect=/home/index 噪音
    const query = fullPath === HOME_URL ? '' : `?redirect=${encodeURIComponent(fullPath)}`;
    return <Navigate replace to={LOGIN_URL + query} />;
  }

  if (token && authMenuList.length && isLoginPage) return <Navigate replace to={HOME_URL} />;

  return props.children;
};

export default RouterGuard;
