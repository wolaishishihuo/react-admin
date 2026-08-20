import { isHttpUrl } from '@/utils/url';
import type { BackendMenuItem, NavigationItem } from './types';

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

/** 后端 `:param` 转为 TanStack `$param` 后再规范化 */
export function toTanStackRoutePath(path: string): string {
  return normalizePath(path.replaceAll(/:([A-Za-z0-9_]+)/g, '$$$1'));
}

function warn(message: string, extra?: unknown) {
  if (import.meta.env.DEV) {
    console.warn(`[navigation] ${message}`, extra ?? '');
  }
}

function toExternal(link?: string) {
  if (!link) return undefined;
  const trimmed = link.trim();
  if (!trimmed) return undefined;
  if (!isHttpUrl(trimmed)) {
    warn('非法 external，已丢弃', trimmed);
    return undefined;
  }
  return trimmed;
}

function normalizeItem(item: BackendMenuItem, index: number, trail: string): NavigationItem | null {
  const rawPath = item.path ?? '';
  const path = rawPath ? toTanStackRoutePath(rawPath) : '';
  const title = item.meta?.title?.trim() ?? '';
  const id = item.meta?.key?.trim() || path || `${trail}/${index}`;

  if (item.element) warn('忽略后端 element，页面由本地 route tree 决定', { path, element: item.element });
  if (item.meta?.isKeepAlive !== undefined) warn('忽略后端 isKeepAlive，以本地 staticData 为准', { path });
  if (item.meta?.multiTab !== undefined) warn('忽略后端 multiTab，以本地 staticData 为准', { path });
  if (item.meta?.activeMenu) warn('忽略后端 meta.activeMenu，以本地 staticData.activeMenu 为准', { path });

  if (!title) {
    warn('丢弃空 title 的菜单项', item);
    return null;
  }

  const children = (item.children ?? [])
    .map((child, childIndex) => normalizeItem(child, childIndex, id))
    .filter((child): child is NavigationItem => child !== null);

  const redirect = item.redirect ? toTanStackRoutePath(item.redirect) : undefined;
  const external = toExternal(item.meta?.isLink);

  return {
    id,
    path,
    title,
    icon: item.meta?.icon,
    hidden: Boolean(item.meta?.isHide),
    fixed: Boolean(item.meta?.isAffix),
    redirect,
    external,
    permissions: item.meta?.auths ?? [],
    children
  };
}

function collectDuplicates(items: NavigationItem[], seenId: Set<string>, seenPath: Set<string>) {
  for (const item of items) {
    if (seenId.has(item.id)) warn('重复菜单 id', item.id);
    else seenId.add(item.id);
    if (item.path) {
      if (seenPath.has(item.path)) warn('重复菜单 path', item.path);
      else seenPath.add(item.path);
    }
    collectDuplicates(item.children, seenId, seenPath);
  }
}

export function normalizeBackendMenu(list: BackendMenuItem[]): NavigationItem[] {
  const tree = list
    .map((item, index) => normalizeItem(item, index, 'root'))
    .filter((item): item is NavigationItem => item !== null);
  collectDuplicates(tree, new Set(), new Set());
  return tree;
}
