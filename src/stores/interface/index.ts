import { type RouteObjectType } from '@/routers/interface';
import { type LoginUserInfo } from '@/types';

export type MenuTypeType = 'left' | 'top' | 'top-left' | 'dual-menu';

export type MenuThemeType = 'design' | 'dark' | 'light';

export type ThemeModeType = 'light' | 'dark' | 'auto';

/* 全局状态 */
export interface GlobalState {
  /** 菜单类型 */
  menuType: MenuTypeType;
  /** 菜单主题三档（isDark 强制覆盖） */
  menuThemeType: MenuThemeType;
  /** 菜单展开宽度 px */
  menuOpenWidth: number;
  compactAlgorithm: boolean;
  borderRadius: number;
  maximize: boolean;
  primary: string;
  /** 用户明暗档位（auto 跟随系统） */
  themeMode: ThemeModeType;
  /** 实际生效暗色（themeMode 解析结果） */
  isDark: boolean;
  isWeak: boolean;
  isHappy: boolean;
  /** Columns 第一列是否显示文字 */
  dualMenuShowText: boolean;
  isCollapse: boolean;
  accordion: boolean;
  watermark: boolean;
  breadcrumb: boolean;
  breadcrumbIcon: boolean;
  tabs: boolean;
  themeDrawerVisible: boolean;
}

/* 标签页菜单属性 */
export interface TabsListProp {
  title: string;
  path: string;
  closable: boolean;
}

/* 标签页状态 */
export interface TabsState {
  tabsList: TabsListProp[];
}

/* 用户状态 */
export interface UserState {
  token: string;
  userInfo: LoginUserInfo;
  searchHistory: string[]; // 菜单 path，最新在前
}

/* 权限状态 */
export interface AuthState {
  authMenuList: RouteObjectType[];
  showMenuList: RouteObjectType[];
  flatMenuList: RouteObjectType[];
  authButtonList: {
    [key: string]: string[];
  };
}
