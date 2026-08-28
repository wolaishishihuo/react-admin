import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMenuByPath, getTabId } from '@/utils';
import { type TabsState, type TabsListProp } from '../interface';
import { useAuthStore } from './auth';

export interface TabsStore extends TabsState {
  setTabsList: (tabsList: TabsListProp[]) => void;
  addTab: (tab: TabsListProp) => void;
  removeTab: (payload: { path: string; isCurrent: boolean }) => void;
  closeTabsOnSide: (payload: { path: string; type: 'left' | 'right' }) => void;
  closeMultipleTab: (payload: { path?: string }) => void;
  validateTabs: () => void;
  setTabTitle: (title: string, path?: string) => void;
}

export const useTabsStore = create<TabsStore>()(
  persist(
    (set, get) => ({
      tabsList: [],
      setTabsList: tabsList => set({ tabsList }),
      addTab: tab => {
        if (get().tabsList.every(item => item.path !== tab.path)) {
          set(state => ({ tabsList: [...state.tabsList, tab] }));
        }
      },
      removeTab: ({ path, isCurrent }) => {
        const { tabsList } = get();
        if (!tabsList.find(item => item.path === path)?.closable) return;
        if (isCurrent) {
          tabsList.forEach((item, index) => {
            if (item.path !== path) return;
            const nextTab = tabsList[index + 1] || tabsList[index - 1];
            if (!nextTab) return;
            window.$navigate(nextTab.path);
          });
        }
        set({ tabsList: tabsList.filter(item => item.path !== path) });
      },
      closeTabsOnSide: ({ path, type }) => {
        const { tabsList } = get();
        const currentIndex = tabsList.findIndex(item => item.path === path);
        if (currentIndex === -1) return;
        const range = type === 'left' ? [0, currentIndex] : [currentIndex + 1, tabsList.length];
        set({
          tabsList: tabsList.filter((item, index) => index < range[0] || index >= range[1] || !item.closable)
        });
      },
      closeMultipleTab: ({ path }) => {
        const { tabsList } = get();
        set({
          tabsList: tabsList.filter(item => item.path === path || !item.closable)
        });
      },
      validateTabs: () => {
        const { tabsList } = get();
        const { flatMenuList } = useAuthStore.getState();
        const nextTabsList = tabsList.filter(item => {
          // 固定标签恒保留；其余反查菜单滤悬空标签（标签 path 带 query，getMenuByPath 会剥掉）
          return !item.closable || Boolean(getMenuByPath(flatMenuList, item.path).path);
        });
        if (nextTabsList.length !== tabsList.length) set({ tabsList: nextTabsList });
      },
      setTabTitle: (title, path) => {
        const tabPath = path || getTabId();
        set(state => ({
          tabsList: state.tabsList.map(item => (item.path === tabPath ? { ...item, title } : item))
        }));
      }
    }),
    {
      name: 'tabs-state',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const setTabsList = (tabsList: TabsListProp[]) => useTabsStore.getState().setTabsList(tabsList);
export const addTab = (tab: TabsListProp) => useTabsStore.getState().addTab(tab);
export const removeTab = (payload: { path: string; isCurrent: boolean }) => useTabsStore.getState().removeTab(payload);
export const closeTabsOnSide = (payload: { path: string; type: 'left' | 'right' }) =>
  useTabsStore.getState().closeTabsOnSide(payload);
export const closeMultipleTab = (payload: { path?: string }) => useTabsStore.getState().closeMultipleTab(payload);
export const validateTabs = () => useTabsStore.getState().validateTabs();
export const setTabTitle = (title: string, path?: string) => useTabsStore.getState().setTabTitle(title, path);
