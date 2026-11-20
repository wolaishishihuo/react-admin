import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { TabsAction, TabsState } from '@/stores/interface';

type TabsStoreState = TabsState & TabsAction;

export const useTabsStore = create<TabsStoreState>()(
  immer(
    persist(
      (set, get) => ({
        tabsList: [],
        setTabsList: tabsList =>
          set((draft: TabsState) => {
            draft.tabsList = tabsList;
          }),
        addTab: tabs =>
          set((draft: TabsState) => {
            const existIndex = draft.tabsList.findIndex(item => item.path === tabs.path);
            if (existIndex === -1) {
              draft.tabsList.push(tabs);
              return;
            }
            const existing = draft.tabsList[existIndex];
            draft.tabsList[existIndex] = {
              ...existing,
              icon: tabs.icon || existing.icon,
              closable: tabs.closable
            };
          }),
        removeTab: (path, isCurrent) => {
          const currentTabs = get().tabsList;
          const targetIndex = currentTabs.findIndex(item => item.path === path);
          if (targetIndex === -1 || !currentTabs[targetIndex].closable) return null;

          const nextPath = isCurrent ? (currentTabs[targetIndex + 1]?.path ?? currentTabs[targetIndex - 1]?.path ?? null) : null;

          set((draft: TabsState) => {
            draft.tabsList = draft.tabsList.filter(item => item.path !== path);
          });

          return nextPath;
        },
        closeTabsOnSide: (path, type) =>
          set((draft: TabsState) => {
            const currentIndex = draft.tabsList.findIndex(item => item.path === path);
            if (currentIndex !== -1) {
              const range = type === 'left' ? [0, currentIndex] : [currentIndex + 1, draft.tabsList.length];
              draft.tabsList = draft.tabsList.filter((item, index) => {
                return index < range[0] || index >= range[1] || !item.closable;
              });
            }
          }),
        closeMultipleTab: path =>
          set((draft: TabsState) => {
            draft.tabsList = draft.tabsList.filter(item => {
              return item.path === path || !item.closable;
            });
          })
      }),
      {
        name: 'hooks-tabs',
        version: 2.0
      }
    )
  )
);
