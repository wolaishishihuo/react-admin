import { theme } from 'antd';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { chartPrimaryTokens } from '@/components/Echarts/theme';
import { useGlobalStore } from '@/stores';
import globalTheme from '@/styles/theme/global';
import headerTheme from '@/styles/theme/header';
import siderTheme from '@/styles/theme/sider';
import { setStyleProperty } from '@/utils';
import { getDarkColor, getLightColor } from '@/utils/color';

type ThemeType = 'light' | 'inverted' | 'dark';

const useTheme = () => {
  const { token } = theme.useToken();

  const { isDark, primary, isGrey, isWeak, borderRadius, compactAlgorithm, siderInverted, headerInverted } = useGlobalStore(
    useShallow(state => ({
      isDark: state.isDark,
      primary: state.primary,
      isGrey: state.isGrey,
      isWeak: state.isWeak,
      borderRadius: state.borderRadius,
      compactAlgorithm: state.compactAlgorithm,
      siderInverted: state.siderInverted,
      headerInverted: state.headerInverted
    }))
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const type: ThemeType = isDark ? 'dark' : 'light';
    Object.entries(globalTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
    Object.entries(token).forEach(([key, val]) => setStyleProperty(`--hooks-${key}`, String(val)));
    for (let i = 1; i <= 9; i++) {
      setStyleProperty(`--hooks-colorPrimary${i}`, isDark ? getDarkColor(primary, i / 10) : getLightColor(primary, i / 10));
    }
    Object.entries(chartPrimaryTokens(primary, isDark)).forEach(([key, val]) => setStyleProperty(key, val));
  }, [isDark, primary, borderRadius, compactAlgorithm, token]);

  useEffect(() => {
    document.documentElement.style.filter = isWeak ? 'invert(80%)' : isGrey ? 'grayscale(1)' : '';
  }, [isGrey, isWeak]);

  useEffect(() => {
    const type: ThemeType = isDark ? 'dark' : siderInverted ? 'inverted' : 'light';
    Object.entries(siderTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
  }, [isDark, siderInverted]);

  useEffect(() => {
    const type: ThemeType = isDark ? 'dark' : headerInverted ? 'inverted' : 'light';
    Object.entries(headerTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
  }, [isDark, headerInverted]);
};

export default useTheme;
