import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERSIST_VERSION } from '@/stores/persist';

export type MenuTypeType = 'left' | 'top' | 'top-left' | 'dual-menu';
export type MenuThemeType = 'design' | 'dark' | 'light';
export type PageAnimateMode = 'fade-slide' | 'fade' | 'fade-bottom' | 'fade-scale' | 'zoom-fade' | 'zoom-out' | 'none';

export interface AdminLayoutPersistedState {
  menuType: MenuTypeType;
  menuThemeType: MenuThemeType;
  menuOpenWidth: number;
  dualMenuShowText: boolean;
  isCollapse: boolean;
  accordion: boolean;
  watermark: boolean;
  breadcrumb: boolean;
  breadcrumbIcon: boolean;
  tabs: boolean;
  pageAnimate: boolean;
  pageAnimateMode: PageAnimateMode;
}

interface AdminLayoutState extends AdminLayoutPersistedState {
  maximize: boolean;
  themeDrawerVisible: boolean;
}

interface AdminLayoutStore extends AdminLayoutState {
  patch: (payload: Partial<AdminLayoutState>) => void;
}

const initialPersisted: AdminLayoutPersistedState = {
  menuType: 'left',
  menuThemeType: 'design',
  menuOpenWidth: 230,
  dualMenuShowText: true,
  isCollapse: false,
  accordion: true,
  watermark: true,
  breadcrumb: true,
  breadcrumbIcon: false,
  tabs: true,
  pageAnimate: true,
  pageAnimateMode: 'fade-slide'
};

export const useAdminLayoutStore = create<AdminLayoutStore>()(
  persist(
    set => ({
      ...initialPersisted,
      maximize: false,
      themeDrawerVisible: false,
      patch: payload => set(payload)
    }),
    {
      name: 'admin-layout-state',
      version: PERSIST_VERSION,
      partialize: state => ({
        menuType: state.menuType,
        menuThemeType: state.menuThemeType,
        menuOpenWidth: state.menuOpenWidth,
        dualMenuShowText: state.dualMenuShowText,
        isCollapse: state.isCollapse,
        accordion: state.accordion,
        watermark: state.watermark,
        breadcrumb: state.breadcrumb,
        breadcrumbIcon: state.breadcrumbIcon,
        tabs: state.tabs,
        pageAnimate: state.pageAnimate,
        pageAnimateMode: state.pageAnimateMode
      })
    }
  )
);

export function patchAdminLayout(payload: Partial<AdminLayoutState>) {
  useAdminLayoutStore.getState().patch(payload);
}

export function setAdminLayoutState<K extends keyof AdminLayoutState>(key: K, value: AdminLayoutState[K]) {
  useAdminLayoutStore.getState().patch({ [key]: value } as Partial<AdminLayoutState>);
}
