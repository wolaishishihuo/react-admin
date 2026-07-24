import { theme } from 'antd';
import { useLayoutEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGlobalStore } from '@/stores';
import globalTheme from '@/styles/theme/global';
import siderTheme from '@/styles/theme/sider';
import { setStyleProperty } from '@/utils';
import { getLightColor, getDarkColor } from '@/utils/color';

type ThemeType = 'light' | 'dark';

/** 全局主题设置 Hook：把 antd token 与自定义主题写入 --hooks-* CSS 变量 */
const useTheme = () => {
  const { token } = theme.useToken();

  const { isDark, primary, isWeak, borderRadius, compactAlgorithm } = useGlobalStore(
    useShallow(state => ({
      isDark: state.isDark,
      primary: state.primary,
      isWeak: state.isWeak,
      borderRadius: state.borderRadius,
      compactAlgorithm: state.compactAlgorithm
    }))
  );

  useLayoutEffect(() => switchDark(), [isDark]);
  const switchDark = () => {
    const html = document.documentElement;
    html.setAttribute('class', isDark ? 'dark' : '');
    changePrimary();
  };

  useLayoutEffect(() => changePrimary(), [primary, borderRadius, compactAlgorithm]);
  const changePrimary = () => {
    const type: ThemeType = isDark ? 'dark' : 'light';
    Object.entries(globalTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
    Object.entries(token).forEach(([key, val]) => setStyleProperty(`--hooks-${key}`, val));
    // 主题色浅/深两档（ThemeDrawer 消费）
    for (const i of [5, 8]) {
      setStyleProperty(
        `--hooks-colorPrimary${i}`,
        isDark ? `${getDarkColor(primary, i / 10)}` : `${getLightColor(primary, i / 10)}`
      );
    }
  };

  useLayoutEffect(() => changeWeak(), [isWeak]);
  const changeWeak = () => {
    const html = document.documentElement;
    html.style.filter = isWeak ? 'invert(80%)' : '';
  };

  useLayoutEffect(() => changeSiderTheme(), [isDark]);
  const changeSiderTheme = () => {
    const type: ThemeType = isDark ? 'dark' : 'light';
    Object.entries(siderTheme[type]).forEach(([key, val]) => setStyleProperty(key, val));
  };
};

export default useTheme;
