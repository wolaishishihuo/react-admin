import type { NavigationItem } from './types';
import { normalizePath } from './menu-normalize';

export function flattenMenu(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap(item => [item, ...flattenMenu(item.children)]);
}

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

export function createAuthorizedPathSet(items: NavigationItem[], catalog?: Set<string>): Set<string> {
  const pathSet = new Set<string>();
  for (const item of flattenMenu(items)) {
    if (item.path && (!catalog || catalog.has(item.path))) pathSet.add(item.path);
    if (item.redirect && (!catalog || catalog.has(item.redirect))) pathSet.add(item.redirect);
  }
  return pathSet;
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

function warnUnknownPath(path: string) {
  if (import.meta.env.DEV) console.warn('[navigation] 未知后端 path，已从导航删除', path);
}

function warnUnknownRedirect(path: string) {
  if (import.meta.env.DEV) console.warn('[navigation] 未知 redirect，已删除', path);
}

export function intersectMenuWithRoutes(tree: NavigationItem[], catalog: Set<string>): NavigationItem[] {
  const walk = (items: NavigationItem[]): NavigationItem[] => {
    const result: NavigationItem[] = [];
    for (const item of items) {
      const children = walk(item.children);
      const pathOk = Boolean(item.path && catalog.has(item.path));
      const redirectOk = Boolean(item.redirect && catalog.has(item.redirect));
      const isExternal = Boolean(item.external);

      if (item.redirect && !redirectOk) warnUnknownRedirect(item.redirect);

      if (!pathOk && !isExternal && children.length === 0) {
        if (item.path) warnUnknownPath(item.path);
        continue;
      }

      const nextItem: NavigationItem = { ...item, children };
      if (!redirectOk) delete nextItem.redirect;
      result.push(nextItem);
    }
    return result;
  };

  return walk(tree);
}

export type { NavigationItem };
