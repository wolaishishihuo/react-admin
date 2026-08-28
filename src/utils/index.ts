import { RequestData } from '@ant-design/pro-components';

import { ResPage } from '@/apis/interface';
import { RouterModeEnum } from '@/constants';
import { RouteObjectType } from '@/routers/interface';
import { useAuthStore } from '@/stores';

const mode = import.meta.env.VITE_ROUTER_MODE;

/**
 * @description Get the corresponding greeting for the current time.
 * @returns {String}
 */
export function getTimeState() {
  let timeNow = new Date();
  let hours = timeNow.getHours();
  if (hours >= 6 && hours <= 10) return `早上好 ⛅`;
  if (hours >= 10 && hours <= 14) return `中午好 🌞`;
  if (hours >= 14 && hours <= 18) return `下午好 🌞`;
  if (hours >= 18 && hours <= 24) return `晚上好 🌛`;
  if (hours >= 0 && hours <= 6) return `凌晨好 🌛`;
}

/**
 * @description Generate random numbers
 * @param {Number} min minimum value
 * @param {Number} max Maximum value
 * @return {Number}
 */
export function randomNum(min: number, max: number): number {
  let num = Math.floor(Math.random() * (min - max) + max);
  return num;
}

/**
 * @description Set style properties
 * @param {String} key - The key name of the style property
 * @param {String} val - The value of the style attribute
 */
export function setStyleProperty(key: string, val: string) {
  document.documentElement.style.setProperty(key, val);
}

/**
 * @description Convert a 3-digit HEX color code to a 6-digit code.
 * @returns {String}
 */
export function convertToSixDigitHexColor(str: string) {
  if (str.length > 4) return str.toLocaleUpperCase();
  else return (str[0] + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]).toLocaleUpperCase();
}

/**
 * @description Flatten the menu using recursion for easier addition of dynamic routes.
 * @param {Array} menuList - The menu list.
 * @returns {Array}
 */
export function getFlatMenuList(menuList: RouteObjectType[]): RouteObjectType[] {
  let newMenuList: RouteObjectType[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.flatMap(item => [item, ...(item.children ? getFlatMenuList(item.children) : [])]);
}

/**
 * @description Use recursion to filter out the menu items that need to be rendered in the left menu (excluding menus with isHide == true).
 * @param {Array} menuList - The menu list.
 * @returns {Array}
 */
export function getShowMenuList(menuList: RouteObjectType[]) {
  let newMenuList: RouteObjectType[] = JSON.parse(JSON.stringify(menuList));
  return newMenuList.filter(item => {
    item.children?.length && (item.children = getShowMenuList(item.children));
    return !item.meta?.isHide;
  });
}

/**
 * @description Obtain the first level menu
 * @param {RouteObjectType[]} menuList - The menu list.
 * @returns {RouteObjectType[]}
 */
export function getFirstLevelMenuList(menuList: RouteObjectType[]) {
  return menuList.map(item => {
    return { ...item, children: undefined };
  });
}

/**
 * @description Get a menu object with a path
 * @param {Array} menulist - The list of menu objects to search through.
 * @param {string} path - The path to match with the menu objects' paths.
 * @returns {Object} The matched menu object or null if no match is found.
 */
export function getMenuByPath(
  menulist: RouteObjectType[] = useAuthStore.getState().flatMenuList,
  path: string = getUrlWithParams()
) {
  const menuItem = menulist.find(menu => {
    // Match Dynamic routing through regular
    const regex = new RegExp(`^${menu.path?.replace(/:.[^/]*/, '.*')}$`);
    return regex.test(path);
  });
  return menuItem || {};
}

/**
 * @description Use recursion to find all breadcrumbs and store them in redux.
 * @param {Array} menuList - The menu list.
 * @param {Array} parent - The parent menu.
 * @param {Object} result - The processed result.
 * @returns {Object}
 */
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

/**
 * @description Get relative url with params
 * @returns {String}
 */
export function getUrlWithParams() {
  const url: Record<RouterModeEnum, string> = {
    [RouterModeEnum.HASH]: location.hash.substring(1),
    [RouterModeEnum.HISTORY]: location.pathname + location.search
  };
  return url[mode];
}

/**
 * @description Get the subMenu keys that need to be expanded.
 * @param {String} path - The current path.
 * @returns {Array}
 */
export function getOpenKeys(path: string): string[] {
  let currentKey: string = '';
  let openKeys: string[] = [];
  let pathSegments: string[] = path.split('/').map((segment: string) => '/' + segment);
  for (let i: number = 1; i < pathSegments.length - 1; i++) {
    currentKey += pathSegments[i];
    openKeys.push(currentKey);
  }
  return openKeys;
}

export function getParentPaths(menuList: RouteObjectType[], path: string): string[] {
  const visit = (list: RouteObjectType[], parents: string[]): string[] | null => {
    for (const item of list) {
      if (item.path === path) return parents;
      if (item.children?.length) {
        const found = visit(item.children, [...parents, item.path!]);
        if (found) return found;
      }
    }
    return null;
  };
  return visit(menuList, []) ?? [];
}

export function getRootMenuPath(menuList: RouteObjectType[], path: string): string {
  return getParentPaths(menuList, path)[0] ?? path;
}

export function getTabId(fullPath: string = getUrlWithParams()): string {
  return fullPath.split('?')[0];
}

/**
 * @description Format the data returned by the server for the ProTable component.
 * @param {Object} data - The data returned by the server.
 * @returns {Object}
 */
export function formatDataForProTable<T>(data: ResPage<T>): Partial<RequestData<T>> {
  return {
    success: true,
    data: data.list,
    total: data.total
  };
}

/**
 * @description A function to execute a block of code and prevent debugging in the browser.
 * @returns {number} - The ID of the setInterval, which can be used to stop the execution later.
 */
export function blockDebugger() {
  function innerFunction() {
    try {
      // Prevent debugging by invoking the "debugger" statement using unconventional syntax
      (function () {
        return false;
      })
        ['constructor']('debugger')
        ['call']();
    } catch (err) {
      console.log('Debugger is blocked');
    }
  }
  // Start the execution using setInterval and return the interval ID
  return setInterval(innerFunction, 50);
}
