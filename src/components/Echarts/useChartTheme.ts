import { type DependencyList, useEffect, useMemo, useState } from 'react';

import { useGlobalStore } from '@/stores';

import type { ECOption } from './config';
import { type ChartTheme, readChartTheme } from './theme';

/**
 * `primary` 只用来在设置改色后重读。
 * useTheme 在 effect 里写 `--hooks-chartPrimary*`，所以等一帧再读。
 */
const useChartTheme = () => {
  const isDark = useGlobalStore(state => state.isDark);
  const primary = useGlobalStore(state => state.primary);
  const [theme, setTheme] = useState(() => readChartTheme(isDark));

  useEffect(() => {
    const frame = requestAnimationFrame(() => setTheme(readChartTheme(isDark)));
    return () => cancelAnimationFrame(frame);
  }, [isDark, primary]);

  return theme;
};

/** `deps` 列出 option 真正依赖的入参。create 跟着这些值变，避免每次渲染都 setOption。 */
export function useThemedOption(create: (theme: ChartTheme) => ECOption, deps: DependencyList) {
  const theme = useChartTheme();
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- 通用主题封装由调用方通过 deps 声明真实依赖，create 为内联工厂
  return useMemo(() => create(theme), [theme, ...deps]);
}

export default useChartTheme;
