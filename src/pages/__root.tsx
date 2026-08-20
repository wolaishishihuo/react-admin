import { Outlet, createRootRouteWithContext, useLocation, useMatches } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { AppRouterContext } from '@/router/context';
import NProgress from '@/router/progress';
import RouteError from './error';
import RouteLoading from './loading';
import RouteNotFound from './not-found';

function getDocumentTitle(matches: Array<{ staticData?: { title?: string } }>) {
  const meta = [...matches].reverse().find(match => match.staticData?.title)?.staticData;
  const appTitle = import.meta.env.VITE_GLOB_APP_TITLE;
  return meta?.title ? `${meta.title} - ${appTitle}` : appTitle;
}

function Root() {
  const { pathname } = useLocation();
  const matches = useMatches();

  useEffect(() => {
    document.title = getDocumentTitle(matches);
  }, [matches]);

  useEffect(() => {
    NProgress.done();
    return () => {
      NProgress.start();
    };
  }, [pathname]);

  return <Outlet />;
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: Root,
  beforeLoad: async ({ context }) => {
    if (context.auth.isLoggedIn && !context.auth.isInitialized) {
      await context.auth.initialize();
    }
  },
  pendingComponent: RouteLoading,
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound
});
