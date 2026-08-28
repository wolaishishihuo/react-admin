import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { DEFAULT_PRIMARY } from '@/config';
import { GlobalAction, GlobalState, ThemeModeType } from '@/stores/interface';

export type GlobalStoreState = GlobalState & GlobalAction;

export const useGlobalStore = createWithEqualityFn<GlobalStoreState>()(
  immer(
    persist(
      set => ({
        // Legacy layout contract used by the original HeaderBar/Sidebar/Tabs.
        menuType: 'left',
        menuThemeType: 'design',
        menuOpenWidth: 230,
        themeMode: 'auto' as ThemeModeType,
        dualMenuShowText: true,
        // Compatibility layout fields retained for existing copied screens.
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
        isHappy: true,
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
        breadcrumbIcon: false,
        // tabs
        tabs: true,
        // tabs icon
        tabsIcon: true,
        // tabs drag
        tabsDrag: true,
        // theme box display status
        themeDrawerVisible: false,
        setGlobalState: ((keyOrPayload: keyof GlobalState | { key: keyof GlobalState; value: unknown }, value?: unknown) =>
          set((state: GlobalState) => {
            const key = typeof keyOrPayload === 'object' ? keyOrPayload.key : keyOrPayload;
            state[key] = (typeof keyOrPayload === 'object' ? keyOrPayload.value : value) as never;
          })) as GlobalAction['setGlobalState']
      }),
      {
        name: 'global-state',
        version: 1,
        migrate: persistedState => persistedState as GlobalState
      }
    )
  ),
  shallow
);
