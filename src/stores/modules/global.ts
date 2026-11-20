import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { DEFAULT_PRIMARY, getStorageKey } from '@/config';
import { GlobalAction, GlobalState } from '@/stores/interface';

type GlobalStoreState = GlobalState & GlobalAction;

export const useGlobalStore = create<GlobalStoreState>()(
  immer(
    persist(
      set => ({
        // layout mode (vertical | classic | transverse | columns)
        layout: 'vertical',
        // antd component size ("small" | "middle" | "large")
        componentSize: 'middle',
        // antd compact theme
        compactAlgorithm: false,
        // antd border radius
        borderRadius: 6,
        // Whether the current page is full screen
        maximize: false,
        // theme color
        primary: DEFAULT_PRIMARY,
        // dark mode
        isDark: false,
        // gray mode
        isGrey: false,
        // weakness mode
        isWeak: false,
        // happy mode
        isHappy: false,
        // menu splitting
        menuSplit: true,
        // sidebar Invert Color
        siderInverted: false,
        // head Inverted Color
        headerInverted: false,
        // menu collapse
        isCollapse: false,
        // menu accordion
        accordion: true,
        // water mark
        watermark: true,
        // breadcrumb
        breadcrumb: true,
        // tabs
        tabs: true,
        // tabs icon
        tabsIcon: true,
        // footer
        footer: true,
        // theme box display status
        themeDrawerVisible: false,
        setGlobalState: (key, value) =>
          set((state: GlobalState) => {
            state[key] = value;
          })
      }),
      {
        name: getStorageKey('global'),
        version: 1,
        partialize: state => {
          const { themeDrawerVisible: _drawer, maximize: _maximize, ...persisted } = state;
          return persisted;
        }
      }
    )
  )
);
