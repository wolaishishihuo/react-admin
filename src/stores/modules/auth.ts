import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { AuthAction, AuthState } from '@/stores/interface';
import { getFlatMenuList, getShowMenuList } from '@/utils';

export type AuthStoreState = AuthState & AuthAction;

export const useAuthStore = create<AuthStoreState>()(
  immer(set => ({
    // List of menu permissions
    authMenuList: [],
    // Menu permission list ==> left menu bar rendering, need to remove isHide == true
    showMenuList: [],
    // Menu permission list ==> flattened one-dimensional array menu, mainly used to add dynamic routing
    flatMenuList: [],
    // List of button permissions
    authButtonList: {},
    setAuthButtonList: authButtonList =>
      set((state: AuthState) => {
        state.authButtonList = authButtonList;
      }),
    setAuthMenuList: authMenuList =>
      set((state: AuthState) => {
        state.authMenuList = authMenuList;
        state.flatMenuList = getFlatMenuList(authMenuList);
        state.showMenuList = getShowMenuList(authMenuList);
      })
  }))
);
