import type { NavigationItem } from './types';
import { normalizePath } from './menu-normalize';

export function flattenMenu(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap(item => [item, ...flattenMenu(item.children)]);
}

/** 侧边栏只展示 hidden=false 的节点；隐藏项仍留在 tree / pathMap 里给授权和 keepAlive 用。 */
export function filterVisibleMenu(items: NavigationItem[]): NavigationItem[] {
  return items.filter(item => !item.hidden).map(item => ({ ...item, children: filterVisibleMenu(item.children) }));
}

export function createMenuPathMap(items: NavigationItem[]): Map<string, NavigationItem> {
  const map = new Map<string, NavigationItem>();
  for (const item of flattenMenu(items)) {
    if (item.path) map.set(item.path, item);
  }
  return map;
}

export function createPermissionMap(items: NavigationItem[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const item of flattenMenu(items)) {
    if (item.permissions.length) map.set(item.path || item.id, item.permissions);
  }
  return map;
}

export function createAuthorizedPathSet(items: NavigationItem[]): Set<string> {
  return new Set(createMenuPathMap(items).keys());
}

export function findMenuByPath(items: NavigationItem[], path: string): NavigationItem | undefined {
  const target = normalizePath(path);
  return flattenMenu(items).find(item => item.path === target);
}

export function getAllBreadcrumbList(items: NavigationItem[]): Record<string, NavigationItem[]> {
  const result: Record<string, NavigationItem[]> = {};
  const walk = (list: NavigationItem[], parent: NavigationItem[]) => {
    for (const item of list) {
      const trail = [...parent, item];
      result[item.id] = trail;
      if (item.path) result[item.path] = trail;
      walk(item.children, trail);
    }
  };
  walk(items, []);
  return result;
}

export function getParentPaths(menuList: NavigationItem[], path: string): string[] {
  const target = normalizePath(path);
  const dfs = (list: NavigationItem[], trail: string[]): string[] | null => {
    for (const item of list) {
      if (item.path === target) return trail;
      if (item.children.length) {
        const hit = dfs(item.children, item.path ? [...trail, item.path] : trail);
        if (hit) return hit;
      }
    }
    return null;
  };
  return dfs(menuList, []) ?? [];
}

export function getRootMenuPath(menuList: NavigationItem[], path: string): string {
  return getParentPaths(menuList, path)[0] ?? normalizePath(path);
}

export type { NavigationItem };
