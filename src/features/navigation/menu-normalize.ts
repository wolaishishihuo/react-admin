import type { BackendRoutePayload, BackendRouteResponse } from './types';

export const HOME_PATH = '/home';
export const LOGIN_PATH = '/login';

const HOME_LEGACY_PATH = '/home/index';

/** 规范 path：单个前导 /、去掉末尾 /（根除外）、去掉 query/hash；迁移期映射旧首页 */
export function normalizePath(path: string): string {
  const withoutHash = path.split('#')[0] ?? path;
  const withoutQuery = withoutHash.split('?')[0] ?? withoutHash;
  let result = withoutQuery.replaceAll('\\', '/').trim();
  if (!result.startsWith('/')) result = `/${result}`;
  result = result.replace(/\/{2,}/g, '/');
  if (result.length > 1) result = result.replace(/\/+$/, '');
  if (result === HOME_LEGACY_PATH) return HOME_PATH;
  return result;
}

/** 后端常见 `:userId` 转成本地文件路由的 `$userId` */
export function toTanStackRoutePath(path: string): string {
  return normalizePath(path.replaceAll(/:([A-Za-z0-9_]+)/g, '$$$1'));
}

export function unwrapBackendRoutes(data: BackendRouteResponse | BackendRoutePayload[]): BackendRoutePayload[] {
  return Array.isArray(data) ? data : (data.routes ?? []);
}
