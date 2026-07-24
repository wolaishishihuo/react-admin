import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUrlWithParams } from '@/utils';
import { destroyKeepAlive } from '@/utils/keepAlive';
import { type TabsState, type TabsListProp } from '../interface';

export interface TabsStore extends TabsState {
  setTabsList: (tabsList: TabsListProp[]) => void;
  addTab: (tab: TabsListProp) => void;
  removeTab: (payload: { path: string; isCurrent: boolean }) => void;
  closeTabsOnSide: (payload: { path: string; type: 'left' | 'right' }) => void;
  closeMultipleTab: (payload: { path?: string }) => void;
  validateTabs: (validPaths: string[]) => void;
  setTabTitle: (title: string) => void;
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
        destroyKeepAlive(path);
      },
      closeTabsOnSide: ({ path, type }) => {
        const { tabsList } = get();
        const currentIndex = tabsList.findIndex(item => item.path === path);
        if (currentIndex === -1) return;
        const range = type === 'left' ? [0, currentIndex] : [currentIndex + 1, tabsList.length];
        const removed: string[] = [];
        const nextTabsList = tabsList.filter((item, index) => {
          const keep = index < range[0] || index >= range[1] || !item.closable;
          if (!keep) removed.push(item.path);
          return keep;
        });
        set({ tabsList: nextTabsList });
        destroyKeepAlive(removed);
      },
      closeMultipleTab: ({ path }) => {
        const { tabsList } = get();
        const removed: string[] = [];
        const nextTabsList = tabsList.filter(item => {
          const keep = item.path === path || !item.closable;
          if (!keep) removed.push(item.path);
          return keep;
        });
        set({ tabsList: nextTabsList });
        destroyKeepAlive(removed);
      },
      validateTabs: validPaths => {
        const { tabsList } = get();
        const removed: string[] = [];
        const nextTabsList = tabsList.filter(item => {
          // 固定标签恒保留；其余按菜单校验滤悬空标签
          const keep = !item.closable || validPaths.includes(item.path);
          if (!keep) removed.push(item.path);
          return keep;
        });
        if (removed.length) {
          set({ tabsList: nextTabsList });
          destroyKeepAlive(removed);
        }
      },
      setTabTitle: title => {
        set(state => ({
          tabsList: state.tabsList.map(item => (item.path === getUrlWithParams() ? { ...item, title } : item))
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
export const validateTabs = (validPaths: string[]) => useTabsStore.getState().validateTabs(validPaths);
export const setTabTitle = (title: string) => useTabsStore.getState().setTabTitle(title);
