export function routerMode() {
  return process.env.VITE_ROUTER_MODE === 'history' ? 'history' : 'hash';
}

export function appPath(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return routerMode() === 'history' ? normalized : `/#${normalized}`;
}
