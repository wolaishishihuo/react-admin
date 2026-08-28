import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { UserAction, UserState } from '@/stores/interface';

export type UserStoreState = UserState & UserAction;

export const useUserStore = create<UserStoreState>()(
  immer(
    persist(
      set => ({
        token: '',
        userInfo: { name: 'Hooks' },
        searchHistory: [],
        setToken: token =>
          set((state: UserState) => {
            state.token = token;
          }),
        setUserInfo: userInfo =>
          set((state: UserState) => {
            state.userInfo = userInfo;
          }),
        setSearchHistory: searchHistory =>
          set((state: UserState) => {
            state.searchHistory = searchHistory;
          })
      }),
      {
        name: 'user-state',
        version: 1.0
      }
    )
  )
);

export const addSearchHistory = (path: string) => {
  const { searchHistory, setSearchHistory } = useUserStore.getState();
  setSearchHistory([path, ...searchHistory.filter(item => item !== path)].slice(0, 10));
};

export const removeSearchHistory = (path: string) => {
  const { searchHistory, setSearchHistory } = useUserStore.getState();
  setSearchHistory(searchHistory.filter(item => item !== path));
};
