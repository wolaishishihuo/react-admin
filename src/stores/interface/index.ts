import { RouteObjectType } from '@/routers/interface';

export type SizeType = 'small' | 'middle' | 'large';
export type MenuTypeType = 'left' | 'top' | 'top-left' | 'dual-menu';
export type MenuThemeType = 'design' | 'dark' | 'light';
export type ThemeModeType = 'light' | 'dark' | 'auto';
export type LayoutType = 'vertical' | 'classic' | 'transverse' | 'columns';

/* GlobalState */
export interface GlobalState {
  menuType: MenuTypeType;
  menuThemeType: MenuThemeType;
  menuOpenWidth: number;
  themeMode: ThemeModeType;
  dualMenuShowText: boolean;
  // Compatibility fields retained for copied pages that still read the newer layout settings.
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
  themeDrawerVisible: boolean;
}

export interface GlobalAction {
  setGlobalState: <T extends keyof GlobalState>(key: T, value: GlobalState[T]) => void;
  setThemeMode: (mode: ThemeModeType) => void;
}

/* tabsMenuProps */
export interface TabsListProp {
  title: string;
  path: string;
  closable: boolean;
}

/* TabsState */
export interface TabsState {
  tabsList: TabsListProp[];
}

export interface TabsAction {
  setTabsList: (tabsList: TabsState['tabsList']) => void;
  addTab: (tabs: TabsListProp) => void;
  removeTab: (payload: { path: string; isCurrent: boolean }) => void;
  closeTabsOnSide: (payload: { path: string; type: 'left' | 'right' }) => void;
  closeMultipleTab: (payload: { path?: string }) => void;
  validateTabs: () => void;
  setTabTitle: (title: string) => void;
}

/* UserState */
export interface UserState {
  token: string;
  userInfo: { name: string };
  searchHistory: string[];
}

export interface UserAction {
  setToken: (token: UserState['token']) => void;
  setUserInfo: (token: UserState['userInfo']) => void;
  setSearchHistory: (searchHistory: string[]) => void;
}

/* AuthState */
export interface AuthState {
  authMenuList: RouteObjectType[];
  showMenuList: RouteObjectType[];
  flatMenuList: RouteObjectType[];
  authButtonList: Record<string, string[]>;
}

export interface AuthAction {
  setAuthButtonList: (authButtonList: AuthState['authButtonList']) => void;
  setAuthMenuList: (authMenuList: AuthState['authMenuList']) => void;
}
