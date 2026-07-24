import { create } from 'zustand';
import { getAuthButtonList, getFlatMenuList, getShowMenuList } from '@/utils';
import { type AuthState } from '../interface';

export interface AuthStore extends AuthState {
  setAuthMenuList: (authMenuList: AuthState['authMenuList']) => void;
}

/** 不持久化：菜单/按钮权限每次加载重拉 */
export const useAuthStore = create<AuthStore>()(set => ({
  authMenuList: [],
  /** 侧栏用，已滤 isHide */
  showMenuList: [],
  /** 扁平菜单，动态路由用 */
  flatMenuList: [],
  /** 自菜单 meta.auths 派生 */
  authButtonList: {},
  setAuthMenuList: authMenuList =>
    set({
      authMenuList,
      flatMenuList: getFlatMenuList(authMenuList),
      showMenuList: getShowMenuList(authMenuList),
      authButtonList: getAuthButtonList(authMenuList)
    })
}));

export const setAuthMenuList = (authMenuList: AuthState['authMenuList']) => useAuthStore.getState().setAuthMenuList(authMenuList);
