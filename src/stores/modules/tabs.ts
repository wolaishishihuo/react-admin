import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

import { TabsAction, TabsState } from "@/stores/interface";
import { getUrlWithParams } from "@/utils";

export type TabsStoreState = TabsState & TabsAction;

export const useTabsStore = createWithEqualityFn<TabsStoreState>()(
  immer(
    persist(
      set => ({
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
        removeTab: (path, isCurrent) =>
          set((draft: TabsState) => {
            if (!draft.tabsList.find(item => item.path === path)?.closable) return;
            if (isCurrent) {
              draft.tabsList.forEach((item, index) => {
                if (item.path !== path) return;
                const nextTab = draft.tabsList[index + 1] || draft.tabsList[index - 1];
                if (!nextTab) return;
                window.$navigate(nextTab.path);
              });
            }
            draft.tabsList = draft.tabsList.filter(item => item.path !== path);
          }),
        closeTabsOnSide: (path, type) =>
          set((draft: TabsState) => {
            const currentIndex = draft.tabsList.findIndex(item => item.path === path);
            if (currentIndex !== -1) {
              const range = type === "left" ? [0, currentIndex] : [currentIndex + 1, draft.tabsList.length];
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
          }),
        setTabTitle: title =>
          set((draft: TabsState) => {
            draft.tabsList = draft.tabsList.map(item => {
              if (item.path == getUrlWithParams()) {
                return { ...item, title: title };
              }
              return item;
            });
          })
      }),
      {
        name: "hooks-tabs",
        version: 2.0
      }
    )
  ),
  shallow
);
