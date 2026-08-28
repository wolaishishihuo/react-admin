export function routerMode() {
  return process.env.VITE_ROUTER_MODE === 'history' ? 'history' : 'hash';
}

export function authRouteMode() {
  return process.env.VITE_AUTH_ROUTE_MODE === 'dynamic' ? 'dynamic' : 'static';
}

export function appPath(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return routerMode() === 'history' ? normalized : `/#${normalized}`;
}
