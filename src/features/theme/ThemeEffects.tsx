import { theme } from 'antd';
import { useLayoutEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { selectIsDark, useThemeStore } from '@/stores/modules/theme.store';
import globalTheme from '@/features/theme/tokens/global';
import siderTheme from '@/features/theme/tokens/sider';
import { getDarkColor, getLightColor } from '@/utils/color';

type ThemeType = 'light' | 'dark';

function setStyleProperty(key: string, val: string) {
  document.documentElement.style.setProperty(key, val);
}

export default function ThemeEffects() {
  const { token } = theme.useToken();
  const { isDark, primary, isWeak, borderRadius, compactAlgorithm } = useThemeStore(
    useShallow(state => ({
      isDark: selectIsDark(state),
      primary: state.primary,
      isWeak: state.isWeak,
      borderRadius: state.borderRadius,
      compactAlgorithm: state.compactAlgorithm
    }))
  );

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('dark', isDark);
    html.style.colorScheme = isDark ? 'dark' : 'light';
    html.style.backgroundColor = isDark ? '#141414' : '#ffffff';
    changePrimary();
  }, [isDark, primary, borderRadius, compactAlgorithm, token]);

  const changePrimary = () => {
    const type: ThemeType = isDark ? 'dark' : 'light';
    Object.entries(globalTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
    Object.entries(token).forEach(([key, val]) => setStyleProperty(`--hooks-${key}`, String(val)));
    for (const i of [5, 8]) {
      setStyleProperty(
        `--hooks-colorPrimary${i}`,
        isDark ? `${getDarkColor(primary, i / 10)}` : `${getLightColor(primary, i / 10)}`
      );
    }
    document.documentElement.style.setProperty('--loading-primary', primary);
  };

  useLayoutEffect(() => {
    document.documentElement.style.filter = isWeak ? 'invert(80%)' : '';
  }, [isWeak]);

  useLayoutEffect(() => {
    const type: ThemeType = isDark ? 'dark' : 'light';
    Object.entries(siderTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
  }, [isDark]);

  return null;
}
