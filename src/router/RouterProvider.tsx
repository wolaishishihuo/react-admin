/**
 * Router Context 桥接层：把 Query/Zustand 中的认证状态和菜单加载能力注入 TanStack Router。
 * 同时在此连接 HTTP 401 与会话失效，避免 HTTP 层静态依赖认证模块。
 */
import { RouterProvider as TanStackRouterProvider } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { authUserQueryOptions } from '@/features/auth/queries';
import { expireCurrentSession, initializeSession, isLoggedIn, refreshCurrentToken, revokeSession } from '@/features/auth/session';
import { ensureAuthorizedNavigation } from '@/features/navigation/menu-query';
import { queryClient } from '@/services/query/client';
import { registerTokenRefreshHandler, registerUnauthorizedHandler } from '@/services/http/unauthorized';
import { useSessionStore } from '@/stores/modules/session.store';
import type { AppRouterContext } from './context';
import { router } from './index';
import { getRouter } from './router-ref';

// 模块加载时注册一次；并发 401 的 single-flight 由 unauthorized 模块负责。
registerUnauthorizedHandler(expireCurrentSession);
registerTokenRefreshHandler(refreshCurrentToken);

export default function RouterProvider() {
  const token = useSessionStore(state => state.token);
  const initialized = useSessionStore(state => state.initialized);
  const { data: user } = useQuery({
    ...authUserQueryOptions(),
    enabled: Boolean(token)
  });

  const context = useMemo<AppRouterContext>(
    () => ({
      auth: {
        isLoggedIn: Boolean(token) || isLoggedIn(),
        isInitialized: initialized,
        user: user ?? null,
        initialize: initializeSession,
        revoke: revokeSession
      },
      navigation: {
        ensureMenu: () => ensureAuthorizedNavigation(queryClient, getRouter())
      }
    }),
    [token, initialized, user]
  );

  return <TanStackRouterProvider router={router} context={context} />;
}
