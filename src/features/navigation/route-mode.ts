export type AuthRouteMode = 'static' | 'dynamic';

export const AUTH_ROUTE_MODE: AuthRouteMode = import.meta.env.VITE_AUTH_ROUTE_MODE === 'dynamic' ? 'dynamic' : 'static';
