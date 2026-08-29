import type { ConfigProviderProps } from "antd";

import { RouteObjectType } from "@/routers/interface";

export type SizeType = NonNullable<ConfigProviderProps["componentSize"]>;

export type LayoutType = "vertical" | "classic" | "transverse" | "columns";

/* GlobalState */
export interface GlobalState {
  layout: LayoutType;
  componentSize: SizeType;
  compactAlgorithm: boolean;
  borderRadius: number;
  maximize: boolean;
  primary: string;
  isDark: boolean;
  isGrey: boolean;
  isWeak: boolean;
  isHappy: boolean;
  menuSplit: boolean;
  siderInverted: boolean;
  headerInverted: boolean;
  isCollapse: boolean;
  accordion: boolean;
  watermark: boolean;
  breadcrumb: boolean;
  breadcrumbIcon: boolean;
  tabs: boolean;
  tabsIcon: boolean;
  tabsDrag: boolean;
  footer: boolean;
  themeDrawerVisible: boolean;
}

export interface GlobalAction {
  setGlobalState: <T extends keyof GlobalState>(key: T, value: GlobalState[T]) => void;
}

/* tabsMenuProps */
export interface TabsListProp {
  icon: string;
  title: string;
  path: string;
  closable: boolean;
}

/* TabsState */
export interface TabsState {
  tabsList: TabsListProp[];
}

export interface TabsAction {
  setTabsList: (tabsList: TabsState["tabsList"]) => void;
  addTab: (tabs: TabsListProp) => void;
  removeTab: (path: string, isCurrent: boolean) => void;
  closeTabsOnSide: (path: string, type: "left" | "right") => void;
  closeMultipleTab: (path?: string) => void;
  setTabTitle: (title: string) => void;
}

/* UserState */
export interface UserState {
  token: string;
  userInfo: { name: string };
}

export interface UserAction {
  setToken: (token: UserState["token"]) => void;
  setUserInfo: (token: UserState["userInfo"]) => void;
}

/* AuthState */
export interface AuthState {
  authMenuList: RouteObjectType[];
  showMenuList: RouteObjectType[];
  flatMenuList: RouteObjectType[];
  authButtonList: Record<string, string[]>;
}

export interface AuthAction {
  setAuthButtonList: (authButtonList: AuthState["authButtonList"]) => void;
  setAuthMenuList: (authMenuList: AuthState["authMenuList"]) => void;
}
