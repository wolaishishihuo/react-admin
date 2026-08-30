import { theme } from 'antd';
import { useEffect } from 'react';

import { useGlobalStore } from '@/stores';
import globalTheme from '@/styles/theme/global';
import headerTheme from '@/styles/theme/header';
import siderTheme from '@/styles/theme/sider';
import { setStyleProperty } from '@/utils';
import { getDarkColor, getLightColor } from '@/utils/color';

type ThemeType = 'light' | 'inverted' | 'dark';

/**
 * @description  Use global theme settings hook
 */
const useTheme = () => {
  const { token } = theme.useToken();

  const { isDark, primary, isGrey, isWeak, borderRadius, compactAlgorithm, siderInverted, headerInverted } = useGlobalStore(
    state => ({
      isDark: state.isDark,
      primary: state.primary,
      isGrey: state.isGrey,
      isWeak: state.isWeak,
      borderRadius: state.borderRadius,
      compactAlgorithm: state.compactAlgorithm,
      siderInverted: state.siderInverted,
      headerInverted: state.headerInverted
    })
  );

  /**
   * @description Toggle dark mode
   */
  useEffect(() => switchDark(), [isDark]);
  const switchDark = () => {
    const html = document.documentElement;
    html.setAttribute('class', isDark ? 'dark' : '');
    changePrimary();
  };

  /**
   * @description Toggle primary colors
   */
  useEffect(() => changePrimary(), [primary, borderRadius, compactAlgorithm]);
  const changePrimary = () => {
    const type: ThemeType = isDark ? 'dark' : 'light';
    // custom less variable
    Object.entries(globalTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
    // antd less variable
    Object.entries(token).forEach(([key, val]) => setStyleProperty(`--hooks-${key}`, val));
    // antd primaryColor less variable
    for (let i = 1; i <= 9; i++) {
      setStyleProperty(
        `--hooks-colorPrimary${i}`,
        isDark ? `${getDarkColor(primary, i / 10)}` : `${getLightColor(primary, i / 10)}`
      );
    }
  };

  /**
   * @description Switch between gray and weak colors
   */
  useEffect(() => changeGreyOrWeak(), [isGrey, isWeak]);
  const changeGreyOrWeak = () => {
    const html = document.documentElement;
    html.style.filter = isWeak ? 'invert(80%)' : isGrey ? 'grayscale(1)' : '';
  };

  /**
   * @description Toggle sider theme
   */
  useEffect(() => changeSiderTheme(), [isDark, siderInverted]);
  const changeSiderTheme = () => {
    const type: ThemeType = isDark ? 'dark' : siderInverted ? 'inverted' : 'light';
    Object.entries(siderTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
  };

  /**
   * @description Toggle header theme
   */
  useEffect(() => changeHeaderTheme(), [isDark, headerInverted]);
  const changeHeaderTheme = () => {
    const type: ThemeType = isDark ? 'dark' : headerInverted ? 'inverted' : 'light';
    Object.entries(headerTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
  };
};

export default useTheme;
