import type { MenuThemeType } from '@/stores/modules/admin-layout.store';

export interface MenuThemeRecipe {
  /** 菜单主题档位类后缀 */
  theme: MenuThemeType;
  background: string;
  textColor: string;
  iconColor: string;
  systemNameColor: string;
}

/* 三档菜单主题配方 */
const MENU_THEMES: Record<MenuThemeType, MenuThemeRecipe> = {
  design: {
    theme: 'design',
    background: 'var(--hooks-colorBgContainer)',
    textColor: '#29343D',
    iconColor: '#6B6B6B',
    systemNameColor: 'var(--hooks-colorTextSider)'
  },
  dark: {
    theme: 'dark',
    background: '#191A23',
    textColor: '#BABBBD',
    iconColor: '#BABBBD',
    systemNameColor: '#D9DADB'
  },
  light: {
    theme: 'light',
    background: '#ffffff',
    textColor: '#29343D',
    iconColor: '#6B6B6B',
    systemNameColor: 'var(--hooks-colorTextSider)'
  }
};

/* isDark 强制覆盖配方 */
const DARK_MODE_RECIPE: MenuThemeRecipe = {
  theme: 'dark',
  background: 'var(--hooks-colorBgContainer)',
  textColor: 'rgba(255, 255, 255, 0.7)',
  iconColor: '#BABBBD',
  systemNameColor: '#DDDDDD'
};

/** 生效配方：isDark 优先 */
export const getMenuTheme = (menuThemeType: MenuThemeType, isDark: boolean): MenuThemeRecipe =>
  isDark ? DARK_MODE_RECIPE : MENU_THEMES[menuThemeType];
