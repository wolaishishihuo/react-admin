import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_PRIMARY } from '@/config';
import { type GlobalState, type ThemeModeType } from '../interface';

export interface GlobalStore extends GlobalState {
  setGlobalState: (payload: ObjToKeyValUnion<GlobalState>) => void;
}

const initialGlobalState: GlobalState = {
  menuType: 'left', // left | top | top-left | dual-menu
  menuThemeType: 'design', // design | dark | light（isDark 强制覆盖）
  menuOpenWidth: 230,
  compactAlgorithm: false,
  borderRadius: 6,
  maximize: false,
  primary: DEFAULT_PRIMARY,
  themeMode: 'auto', // light | dark | auto
  isDark: false, // themeMode 解析后的生效值
  isWeak: false,
  isHappy: true,
  dualMenuShowText: true, // Columns 第一列图标/文字形态
  isCollapse: false,
  accordion: true,
  watermark: true,
  breadcrumb: true,
  breadcrumbIcon: false,
  tabs: true,
  themeDrawerVisible: false
};

export const useGlobalStore = create<GlobalStore>()(
  persist(
    set => ({
      ...initialGlobalState,
      setGlobalState: payload => set({ [payload.key]: payload.value } as Partial<GlobalStore>)
    }),
    {
      name: 'global-state',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

// 组件外独立 action
export const setGlobalState = (payload: ObjToKeyValUnion<GlobalState>) => useGlobalStore.getState().setGlobalState(payload);

/* themeMode 是用户选择，isDark 是解析后的生效值 */
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

export const setThemeMode = (mode: ThemeModeType) => {
  setGlobalState({ key: 'themeMode', value: mode });
  setGlobalState({ key: 'isDark', value: mode === 'auto' ? prefersDark.matches : mode === 'dark' });
};

// auto 跟随系统
prefersDark.addEventListener('change', e => {
  if (useGlobalStore.getState().themeMode === 'auto') setGlobalState({ key: 'isDark', value: e.matches });
});

// 启动校正：auto 档持久化 isDark 可能过期
if (useGlobalStore.getState().themeMode === 'auto' && useGlobalStore.getState().isDark !== prefersDark.matches) {
  setGlobalState({ key: 'isDark', value: prefersDark.matches });
}
