import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERSIST_VERSION } from '@/stores/persist';

export type ThemeModeType = 'light' | 'dark' | 'auto';

export interface ThemePersistedState {
  themeMode: ThemeModeType;
  primary: string;
  isWeak: boolean;
  isHappy: boolean;
  compactAlgorithm: boolean;
  borderRadius: number;
}

interface ThemeState extends ThemePersistedState {
  systemDark: boolean;
}

interface ThemeStore extends ThemeState {
  setThemeMode: (themeMode: ThemeModeType) => void;
  setPrimary: (primary: string) => void;
  setIsWeak: (isWeak: boolean) => void;
  setIsHappy: (isHappy: boolean) => void;
  setCompactAlgorithm: (compactAlgorithm: boolean) => void;
  setBorderRadius: (borderRadius: number) => void;
  setSystemDark: (systemDark: boolean) => void;
}

export const DEFAULT_PRIMARY = '#B40006';

const initialThemeState: ThemePersistedState = {
  themeMode: 'light',
  primary: DEFAULT_PRIMARY,
  isWeak: false,
  isHappy: true,
  compactAlgorithm: false,
  borderRadius: 6
};

export function resolveIsDark(themeMode: ThemeModeType, systemDark: boolean) {
  if (themeMode === 'dark') return true;
  if (themeMode === 'light') return false;
  return systemDark;
}

function readSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      ...initialThemeState,
      systemDark: typeof window === 'undefined' ? false : readSystemDark(),
      setThemeMode: themeMode => set({ themeMode }),
      setPrimary: primary => set({ primary }),
      setIsWeak: isWeak => set({ isWeak }),
      setIsHappy: isHappy => set({ isHappy }),
      setCompactAlgorithm: compactAlgorithm => set({ compactAlgorithm }),
      setBorderRadius: borderRadius => set({ borderRadius }),
      setSystemDark: systemDark => set({ systemDark })
    }),
    {
      name: 'theme-state',
      version: PERSIST_VERSION,
      partialize: state => ({
        themeMode: state.themeMode,
        primary: state.primary,
        isWeak: state.isWeak,
        isHappy: state.isHappy,
        compactAlgorithm: state.compactAlgorithm,
        borderRadius: state.borderRadius
      })
    }
  )
);

export function selectIsDark(state: Pick<ThemeState, 'themeMode' | 'systemDark'>) {
  return resolveIsDark(state.themeMode, state.systemDark);
}

export const setThemeMode = (mode: ThemeModeType) => useThemeStore.getState().setThemeMode(mode);
export const setPrimary = (primary: string) => useThemeStore.getState().setPrimary(primary);

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
prefersDark.addEventListener('change', event => {
  useThemeStore.getState().setSystemDark(event.matches);
});
if (useThemeStore.getState().systemDark !== prefersDark.matches) {
  useThemeStore.getState().setSystemDark(prefersDark.matches);
}
