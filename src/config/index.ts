// ? Global default configuration items

// Home address
export const HOME_URL: string = '/home/index';

// login page address
export const LOGIN_URL: string = '/login';

/** 是否启用 access token 续签 */
export const enableRefreshToken = import.meta.env.VITE_APP_ENABLE_REFRESH_TOKEN !== 'false';

// default theme color
export const DEFAULT_PRIMARY: string = '#B40006';

// Routing whitelist address (must be in a locally existing routing staticRouter.ts)
export const ROUTER_WHITE_LIST: string[] = ['/500'];
