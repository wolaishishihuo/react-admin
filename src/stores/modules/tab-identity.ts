/** 列表忽略 search；multi 详情使用完整 URL */
export function getTabId(routePath: string, multi: boolean, fullPath: string) {
  return multi ? fullPath : routePath;
}

export function getTabNavigateTarget(tab: { routePath: string; fullPath: string }) {
  const queryIndex = tab.fullPath.indexOf('?');
  const search = queryIndex >= 0 ? Object.fromEntries(new URLSearchParams(tab.fullPath.slice(queryIndex)).entries()) : undefined;
  return { to: tab.routePath as never, search };
}
