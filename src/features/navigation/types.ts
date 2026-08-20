export interface BackendMenuMeta {
  key?: string;
  title?: string;
  icon?: string;
  isHide?: boolean;
  isAffix?: boolean;
  isLink?: string;
  auths?: string[];
  isKeepAlive?: boolean;
  multiTab?: boolean;
  activeMenu?: string;
  isFull?: boolean;
}

export interface BackendMenuItem {
  path?: string;
  element?: string;
  redirect?: string;
  meta?: BackendMenuMeta;
  children?: BackendMenuItem[];
}

export interface NavigationItem {
  id: string;
  path: string;
  title: string;
  icon?: string;
  hidden: boolean;
  fixed: boolean;
  redirect?: string;
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
