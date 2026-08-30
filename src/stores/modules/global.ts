import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { DEFAULT_PRIMARY } from '@/config';
import { GlobalAction, GlobalState } from '@/stores/interface';

export type GlobalStoreState = GlobalState & GlobalAction;

export const useGlobalStore = createWithEqualityFn<GlobalStoreState>()(
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
        // breadcrumb icon
        breadcrumbIcon: true,
        // tabs
        tabs: true,
        // tabs icon
        tabsIcon: true,
        // tabs drag
        tabsDrag: true,
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
        name: 'hooks-global',
        version: 1.0
      }
    )
  ),
  shallow
);
