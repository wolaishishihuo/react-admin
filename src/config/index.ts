// ? Global default configuration items

// Home address
export const HOME_URL: string = '/home/index';

// login page address
export const LOGIN_URL: string = '/login';

/** 是否启用 access token 续签 */
export const enableRefreshToken = import.meta.env.VITE_APP_ENABLE_REFRESH_TOKEN !== 'false';

/** 生成带项目前缀的持久化存储 key，避免同源多项目相互污染 */
export function getStorageKey(key: string): string {
  const prefix = import.meta.env.VITE_STORAGE_PREFIX?.trim() || 'react-admin';
  return `${prefix}:${key}`;
}

// default theme color
export const DEFAULT_PRIMARY: string = '#B40006';

// Routing whitelist address (must be in a locally existing routing staticRouter.ts)
export const ROUTER_WHITE_LIST: string[] = ['/500'];
