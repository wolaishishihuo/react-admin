import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type UserState } from '../interface';

export interface UserStore extends UserState {
  setToken: (token: string) => void;
  setUserInfo: (userInfo: UserState['userInfo']) => void;
  setSearchHistory: (searchHistory: string[]) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    set => ({
      token: '',
      userInfo: { name: '' },
      searchHistory: [],
      setToken: token => set({ token }),
      setUserInfo: userInfo => set({ userInfo }),
      setSearchHistory: searchHistory => set({ searchHistory })
    }),
    {
      name: 'user-state',
      storage: createJSONStorage(() => localStorage),
      // 只持久化数据字段
      partialize: state => ({ token: state.token, userInfo: state.userInfo, searchHistory: state.searchHistory })
    }
  )
);

export const setToken = (token: string) => useUserStore.getState().setToken(token);
export const setUserInfo = (userInfo: UserState['userInfo']) => useUserStore.getState().setUserInfo(userInfo);

/* 搜索历史：去重上移，超上限挤最旧 */
const SEARCH_HISTORY_MAX = 10;
export const addSearchHistory = (path: string) => {
  const { searchHistory, setSearchHistory } = useUserStore.getState();
  setSearchHistory([path, ...searchHistory.filter(item => item !== path)].slice(0, SEARCH_HISTORY_MAX));
};
export const removeSearchHistory = (path: string) => {
  const { searchHistory, setSearchHistory } = useUserStore.getState();
  setSearchHistory(searchHistory.filter(item => item !== path));
};
