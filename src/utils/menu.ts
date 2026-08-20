import { type RouteObjectType } from '@/routers/interface';
import { useAuthStore } from '@/stores';

const mode = import.meta.env.VITE_ROUTER_MODE;

/** 递归扁平化菜单，便于添加动态路由 */
export function getFlatMenuList(menuList: RouteObjectType[]): RouteObjectType[] {
  let newMenuList: RouteObjectType[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.flatMap(item => [item, ...(item.children ? getFlatMenuList(item.children) : [])]);
}

/** 递归过滤左侧菜单需渲染的项（排除 isHide == true） */
export function getShowMenuList(menuList: RouteObjectType[]) {
  let newMenuList: RouteObjectType[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.filter(item => {
    item.children?.length && (item.children = getShowMenuList(item.children));
    return !item.meta?.isHide;
  });
}

/** 递归从菜单树派生按钮权限 map，形如 { useProTable: ["add", "export"] } */
export function getAuthButtonList(menuList: RouteObjectType[], result: { [key: string]: string[] } = {}) {
  for (const item of menuList) {
    if (item.meta?.key && item.meta.auths?.length) result[item.meta.key] = item.meta.auths;
    if (item.children?.length) getAuthButtonList(item.children, result);
  }
  return result;
}

/** 获取一级菜单 */
export function getFirstLevelMenuList(menuList: RouteObjectType[]) {
  return menuList.map(item => {
    return { ...item, children: undefined };
  });
}

/** 根据 path 获取菜单对象（剥查询串后匹配，支持动态路由正则），未找到返回空对象 */
export function getMenuByPath(
  menulist: RouteObjectType[] = useAuthStore.getState().flatMenuList,
  path: string = getUrlWithParams()
) {
  const pathname = path.split('?')[0];
  const menuItem = menulist.find(menu => {
    const regex = new RegExp(`^${menu.path?.replace(/:.[^/]*/, '.*')}$`);
    return regex.test(pathname);
  });
  return menuItem || {};
}

/**
 * 标签与缓存的统一身份：默认只认 pathname，menu.meta.multiTab 才带上查询串
 *
 * 详情、编辑这类需要并行开多份的页面才开 multiTab；列表页换查询参数不该多出标签和缓存实例。
 */
export function getTabId(fullPath: string = getUrlWithParams()) {
  const pathname = fullPath.split('?')[0];
  return getMenuByPath(useAuthStore.getState().flatMenuList, pathname).meta?.multiTab ? fullPath : pathname;
}

/** 递归生成面包屑 map：{ [menuKey]: 祖先链（含自身） } */
export function getAllBreadcrumbList(
  menuList: RouteObjectType[],
  parent: RouteObjectType[] = [],
  result: { [key: string]: RouteObjectType[] } = {}
) {
  for (const item of menuList) {
    result[item.meta!.key!] = [...parent, item];
    if (item.children) getAllBreadcrumbList(item.children, result[item.meta!.key!], result);
  }
  return result;
}

/** 获取带参数的相对 URL（按路由模式取 hash 或 pathname） */
export function getUrlWithParams() {
  const url = {
    hash: location.hash.substring(1),
    history: location.pathname + location.search
  };
  return url[mode];
}

/** 菜单树求 path 祖先链（手风琴 openKeys）；禁止 pathname 首段反推 */
export function getParentPaths(menuList: RouteObjectType[], path: string): string[] {
  const dfs = (list: RouteObjectType[], trail: string[]): string[] | null => {
    for (const item of list) {
      if (item.path === path) return trail;
      if (item.children?.length) {
        const hit = dfs(item.children, [...trail, item.path!]);
        if (hit) return hit;
      }
    }
    return null;
  };
  return dfs(menuList, []) ?? [];
}

/** 由菜单树求 path 所属的一级(顶层)菜单 path；顶层项/未命中返回自身 */
export function getRootMenuPath(menuList: RouteObjectType[], path: string): string {
  return getParentPaths(menuList, path)[0] ?? path;
}
