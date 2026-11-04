export type LegendPosition = 'bottom' | 'top' | 'left' | 'right';

export interface ChartTheme {
  axis: string;
  label: string;
  text: string;
  tooltipBg: string;
  tooltipBorder: string;
  primary: string;
  primaryLight: string;
  track: string;
  surface: string;
  centerText: string;
  pieLabel: string;
  radarLabel: string;
  radarGrid: string;
  contrast: string;
  shadow: string;
  empty: string;
  loadingMask: string;
  map: { border: string; shadow: string; label: string };
  colors: string[];
  fontSize: number;
}

export interface ChartGrid {
  top: number;
  right: number;
  bottom: number;
  left: number;
  containLabel: boolean;
}

/** Art 的固定辅助色，集中管理，页面不再单独拼色。 */
const ART_SERIES_COLORS = ['#4ABEFF', '#EDF2FF', '#14DEBA', '#FFAF20', '#FA8A6C', '#FFAF20'];
export const MAP_COLORS = {
  white: '#ffffff',
  border: 'rgba(147,235,248,0.8)',
  start: 'rgba(147,235,248,0.3)',
  end: 'rgba(32,120,207,0.9)',
  shadow: 'rgba(32,120,207,1)',
  hover: 'rgba(82,180,255,0.9)',
  selected: '#4FAEFB',
  pin: '#F99020',
  pinShadow: '#333333'
};

/** 图表的语义 token 独立于 antd 轴线/文字色，避免全局 token 覆盖 Art 的效果。 */
export const CHART_TOKENS = {
  light: {
    '--hooks-chartAxis': '#EDEDED',
    '--hooks-chartLabel': '#999999',
    '--hooks-chartText': '#333333',
    '--hooks-chartTooltipBg': 'rgba(255, 255, 255, 0.9)',
    '--hooks-chartTooltipBorder': '#dddddd',
    '--hooks-chartTrack': '#e6e8f7',
    '--hooks-chartCenterText': '#ADB0BC',
    '--hooks-chartPieLabel': '#999999',
    '--hooks-chartRadarLabel': '#666666',
    '--hooks-chartRadarGrid': '#e6e6e6',
    '--hooks-chartContrast': '#000000',
    '--hooks-chartEmpty': '#B3B2B2',
    '--hooks-chartLoadingMask': 'rgba(255, 255, 255, 0.9)',
    '--hooks-chartMapBorder': 'rgba(147,235,248,1)',
    '--hooks-chartMapShadow': 'rgba(128,217,248,1)',
    '--hooks-chartMapLabel': '#333333',
    '--hooks-chartCardText': '#323251',
    '--hooks-chartCardSecondary': '#7987a1',
    '--hooks-chartPositive': 'oklch(0.78 0.17 166.1)',
    '--hooks-chartNegative': 'oklch(0.68 0.22 25.3)'
  },
  dark: {
    '--hooks-chartAxis': '#444444',
    '--hooks-chartLabel': '#999999',
    '--hooks-chartText': '#ffffff',
    '--hooks-chartTooltipBg': 'rgba(0, 0, 0, 0.8)',
    '--hooks-chartTooltipBorder': '#333333',
    '--hooks-chartTrack': '#e6e8f7',
    '--hooks-chartCenterText': '#999999',
    '--hooks-chartPieLabel': '#cccccc',
    '--hooks-chartRadarLabel': '#cccccc',
    '--hooks-chartRadarGrid': '#444444',
    '--hooks-chartContrast': '#ffffff',
    '--hooks-chartEmpty': '#555555',
    '--hooks-chartLoadingMask': 'rgba(0, 0, 0, 0.8)',
    '--hooks-chartMapBorder': 'rgba(255,255,255,0.6)',
    '--hooks-chartMapShadow': 'rgba(0,0,0,0.8)',
    '--hooks-chartMapLabel': '#ffffff',
    '--hooks-chartCardText': '#e3e3e8',
    '--hooks-chartCardSecondary': '#8f8fa3',
    '--hooks-chartPositive': 'oklch(0.78 0.17 166.1)',
    '--hooks-chartNegative': 'oklch(0.68 0.22 25.3)'
  }
};

function cssVar(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** 支持主题十六进制和 CSS rgb(a) token，不能识别时保留原值。 */
export function withAlpha(color: string, alpha: number) {
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const expanded = hex[1].length === 3 ? [...hex[1]].map(char => char + char).join('') : hex[1];
    const value = Number.parseInt(expanded, 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }
  const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
  return color;
}

/** Art 的色阶向下取整；暗色直接降低亮度，与 antd 的混色算法不同。 */
export function chartPrimaryTokens(primary: string, isDark: boolean) {
  function shade(level: number) {
    const hex = primary.replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return primary;
    return (
      '#' +
      [0, 2, 4]
        .map(offset => {
          const value = Number.parseInt(hex.slice(offset, offset + 2), 16);
          return Math.floor(isDark ? value * (1 - level) : (255 - value) * level + value)
            .toString(16)
            .padStart(2, '0');
        })
        .join('')
    );
  }
  return { '--hooks-chartPrimary': primary, '--hooks-chartPrimaryLight': shade(0.4), '--hooks-chartSeriesPrimary': shade(0.1) };
}

export function readChartTheme(isDark: boolean): ChartTheme {
  const tokens = CHART_TOKENS[isDark ? 'dark' : 'light'];
  function token(name: keyof typeof tokens) {
    return cssVar(name, tokens[name]);
  }
  const primary = cssVar('--hooks-chartPrimary', cssVar('--hooks-colorPrimary', '#1677ff'));
  const primaryTokens = chartPrimaryTokens(primary, isDark);
  return {
    axis: token('--hooks-chartAxis'),
    label: token('--hooks-chartLabel'),
    text: token('--hooks-chartText'),
    tooltipBg: token('--hooks-chartTooltipBg'),
    tooltipBorder: token('--hooks-chartTooltipBorder'),
    primary,
    primaryLight: cssVar('--hooks-chartPrimaryLight', primaryTokens['--hooks-chartPrimaryLight']),
    track: token('--hooks-chartTrack'),
    surface: cssVar('--hooks-colorBgBox', isDark ? '#161618' : '#ffffff'),
    centerText: token('--hooks-chartCenterText'),
    pieLabel: token('--hooks-chartPieLabel'),
    radarLabel: token('--hooks-chartRadarLabel'),
    radarGrid: token('--hooks-chartRadarGrid'),
    contrast: token('--hooks-chartContrast'),
    shadow: '#000000',
    empty: token('--hooks-chartEmpty'),
    loadingMask: token('--hooks-chartLoadingMask'),
    map: {
      border: token('--hooks-chartMapBorder'),
      shadow: token('--hooks-chartMapShadow'),
      label: token('--hooks-chartMapLabel')
    },
    colors: [cssVar('--hooks-chartSeriesPrimary', primaryTokens['--hooks-chartSeriesPrimary']), ...ART_SERIES_COLORS],
    fontSize: 13
  };
}

export function axisLine(theme: ChartTheme, show = true) {
  return { show, lineStyle: { color: theme.axis, width: 1 } };
}

export function splitLine(theme: ChartTheme, show = true) {
  return { show, lineStyle: { color: theme.axis, width: 1, type: 'dashed' as const } };
}

export function axisLabel(theme: ChartTheme, show = true) {
  return { show, color: theme.label, fontSize: theme.fontSize };
}

export function axisTick() {
  return { show: false };
}

export function tooltipStyle(theme: ChartTheme, trigger: 'item' | 'axis' = 'axis') {
  return {
    show: true,
    trigger,
    backgroundColor: theme.tooltipBg,
    borderColor: theme.tooltipBorder,
    borderWidth: 1,
    textStyle: { color: theme.text }
  };
}

export function legendStyle(theme: ChartTheme, position: LegendPosition = 'bottom') {
  const base = {
    textStyle: { color: theme.text },
    itemWidth: 12,
    itemHeight: 12,
    itemGap: 20,
    icon: 'roundRect' as const
  };

  if (position === 'top') return { ...base, top: 0, left: 'center', orient: 'horizontal' as const };
  if (position === 'left') return { ...base, left: 0, top: 'center', orient: 'vertical' as const };
  if (position === 'right') return { ...base, right: 0, top: 'center', orient: 'vertical' as const };
  return { ...base, bottom: 0, left: 'center', orient: 'horizontal' as const };
}

export function gridWithLegend(
  showLegend: boolean,
  position: LegendPosition = 'bottom',
  base: Partial<ChartGrid> = {}
): ChartGrid {
  const grid: ChartGrid = { top: 15, right: 15, bottom: 8, left: 0, containLabel: true, ...base };
  if (!showLegend) return grid;
  if (position === 'top') return { ...grid, top: 40 };
  if (position === 'left') return { ...grid, left: 120 };
  if (position === 'right') return { ...grid, right: 120 };
  return { ...grid, bottom: 40 };
}

export function seriesAnimation(delay = 50, duration = 1500) {
  return {
    animationDelay: (index: number) => index * delay + 200,
    animationDuration: (index: number) => duration - index * 50,
    animationEasing: 'quarticOut' as const
  };
}

export function colorAt(theme: ChartTheme, colors: string[] | undefined, index: number) {
  const palette = colors?.length ? colors : theme.colors;
  return palette[index % palette.length];
}
