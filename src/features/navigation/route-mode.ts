/** 读 `VITE_AUTH_ROUTE_MODE`。static 不打菜单接口；dynamic 登录后拉当前账号菜单。 */
export type AuthRouteMode = 'static' | 'dynamic';

export const AUTH_ROUTE_MODE: AuthRouteMode = import.meta.env.VITE_AUTH_ROUTE_MODE === 'dynamic' ? 'dynamic' : 'static';
