/** 后端 handle 与 meta 等价。buttons 是本模板扩展：static 不打菜单接口时用来挂按钮码。 */
export interface BackendRouteHandle {
  title?: string | null;
  icon?: string | null;
  hideInMenu?: boolean | null;
  keepAlive?: boolean | null;
  multiTab?: boolean | null;
  activeMenu?: string | null;
  href?: string | null;
  order?: number | null;
  fixedIndexInTab?: number | null;
  buttons?: string[] | null;
}

export interface BackendRoutePayload {
  path: string;
  id?: number | string | null;
  name?: string | null;
  handle?: BackendRouteHandle | null;
  meta?: BackendRouteHandle | null;
  children?: BackendRoutePayload[] | null;
  /** 菜单树不使用该字段；需要跳转子页时写文件路由 beforeLoad。 */
  redirect?: string | null;
  /** 忽略。页面组件只来自 src/pages 文件路由。 */
  element?: string | null;
}

export interface BackendRouteResponse {
  home?: string | null;
  routes: BackendRoutePayload[];
}

export interface NavigationItem {
  id: string;
  path: string;
  title: string;
  icon?: string;
  hidden: boolean;
  fixed: boolean;
  keepAlive?: boolean | null;
  multi?: boolean;
  activeMenu?: string;
  order?: number;
  external?: string;
  permissions: string[];
  children: NavigationItem[];
}

export interface AuthorizedNavigation {
  tree: NavigationItem[];
  visibleTree: NavigationItem[];
  pathSet: Set<string>;
  pathMap: Map<string, NavigationItem>;
  permissionMap: Map<string, string[]>;
}
