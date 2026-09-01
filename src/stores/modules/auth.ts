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
    // Flat button codes from GET /users/me
    authButtons: [],
    setAuthButtons: authButtons =>
      set((state: AuthState) => {
        state.authButtons = authButtons;
      }),
    setAuthMenuList: authMenuList =>
      set((state: AuthState) => {
        state.authMenuList = authMenuList;
        state.flatMenuList = getFlatMenuList(authMenuList);
        state.showMenuList = getShowMenuList(authMenuList);
      })
  }))
);
