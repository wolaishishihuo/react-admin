import type { AnyRouter } from '@tanstack/react-router';

let routerRef: AnyRouter | null = null;

export function setRouter(router: AnyRouter) {
  routerRef = router;
}

export function getRouter() {
  if (!routerRef) throw new Error('[router-ref] router is not initialized');
  return routerRef;
}

export function navigateTo(href: string, options?: { replace?: boolean }) {
  const history = getRouter().history;
  if (options?.replace) history.replace(href);
  else history.push(href);
}
