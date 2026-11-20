import { RequestData } from '@ant-design/pro-components';

import { ResPage } from '@/apis/interface';
import { RouteObjectType } from '@/routers/interface';

/**
 * @description Get the corresponding greeting for the current time.
 */
export function getTimeState() {
  const hours = new Date().getHours();
  if (hours >= 6 && hours <= 10) return '早上好 ⛅';
  if (hours > 10 && hours <= 14) return '中午好 🌞';
  if (hours > 14 && hours <= 18) return '下午好 🌞';
  if (hours > 18 && hours <= 24) return '晚上好 🌛';
  return '凌晨好 🌛';
}

/**
 * @description Set CSS custom property on document root
 */
export function setStyleProperty(key: string, val: string) {
  document.documentElement.style.setProperty(key, val);
}

/**
 * @description Flatten the menu using recursion for easier addition of dynamic routes.
 */
export function getFlatMenuList(menuList: RouteObjectType[]): RouteObjectType[] {
  const newMenuList: RouteObjectType[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.flatMap(item => [item, ...(item.children ? getFlatMenuList(item.children) : [])]);
}

/**
 * @description Use recursion to filter out the menu items that need to be rendered in the left menu (excluding menus with isHide == true).
 */
export function getShowMenuList(menuList: RouteObjectType[]) {
  const newMenuList: RouteObjectType[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.filter(item => {
    if (item.children?.length) {
      item.children = getShowMenuList(item.children);
    }
    return !item.meta?.isHide;
  });
}

/**
 * @description Obtain the first level menu
 */
export function getFirstLevelMenuList(menuList: RouteObjectType[]) {
  return menuList.map(item => ({ ...item, children: undefined }));
}

/**
 * @description Use recursion to find all breadcrumbs.
 */
export function getAllBreadcrumbList(
  menuList: RouteObjectType[],
  parent: RouteObjectType[] = [],
  result: Record<string, RouteObjectType[]> = {}
) {
  for (const item of menuList) {
    result[item.meta!.key!] = [...parent, item];
    if (item.children) getAllBreadcrumbList(item.children, result[item.meta!.key!], result);
  }
  return result;
}

/**
 * @description Get the subMenu keys that need to be expanded.
 */
export function getOpenKeys(path: string): string[] {
  let currentKey = '';
  const openKeys: string[] = [];
  const pathSegments = path.split('/').map(segment => '/' + segment);
  for (let i = 1; i < pathSegments.length - 1; i++) {
    currentKey += pathSegments[i];
    openKeys.push(currentKey);
  }
  return openKeys;
}

/**
 * @description Format the data returned by the server for the ProTable component.
 */
export function formatDataForProTable<T>(data: ResPage<T>): Partial<RequestData<T>> {
  return {
    success: true,
    data: data.list,
    total: data.total
  };
}
