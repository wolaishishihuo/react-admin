export type LegendPosition = 'bottom' | 'top' | 'left' | 'right';

export interface ChartTheme {
  /** 轴线、虚线网格 */
  axis: string;
  /** 轴标签 */
  label: string;
  /** 图例、tooltip 正文 */
  text: string;
  tooltipBg: string;
  tooltipBorder: string;
  primary: string;
  /** 单系列柱体渐变的浅端 */
  primaryLight: string;
  /** 环形图的对比扇区、雷达底 */
  track: string;
  /** 扇区之间的缝，跟卡片底一致 */
  surface: string;
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

/** art 色板从第二格起是固定色。第一格用 useTheme 已经写好的 `--hooks-colorPrimary1`。 */
const ART_SERIES_COLORS = ['#4ABEFF', '#EDF2FF', '#14DEBA', '#FFAF20', '#FA8A6C', '#FFAF20'] as const;

function seriesColors(seriesPrimary: string) {
  return [seriesPrimary, ...ART_SERIES_COLORS];
}

const LIGHT_FALLBACK: ChartTheme = {
  axis: '#EDEDED',
  label: '#999999',
  text: '#333333',
  tooltipBg: 'rgba(255, 255, 255, 0.9)',
  tooltipBorder: '#dddddd',
  primary: '#1677ff',
  primaryLight: '#91caff',
  track: '#dbdfe1',
  surface: '#ffffff',
  colors: seriesColors('#1677ff'),
  fontSize: 13
};

const DARK_FALLBACK: ChartTheme = {
  axis: '#444444',
  label: '#999999',
  text: '#ffffff',
  tooltipBg: 'rgba(0, 0, 0, 0.8)',
  tooltipBorder: '#333333',
  primary: '#1677ff',
  primaryLight: '#3c89e8',
  track: '#505062',
  surface: '#161618',
  colors: seriesColors('#1677ff'),
  fontSize: 13
};

function cssVar(name: string, fallback: string) {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** 把 hex / rgb 收成 ECharts 能画的 rgba。失败时原样返回，不弹提示。 */
export function withAlpha(color: string, alpha: number) {
  const hex = color.trim().match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const value = Number.parseInt(hex[1], 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  const rgb = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
  return color;
}

/** 在调用时读 CSS 变量。ECharts 画不出 var()。传了 `colors` 的图不走这套色板。 */
export function readChartTheme(isDark: boolean): ChartTheme {
  const fallback = isDark ? DARK_FALLBACK : LIGHT_FALLBACK;
  const primary = cssVar('--hooks-colorPrimary', fallback.primary);
  const primaryLight = cssVar('--hooks-colorPrimary4', fallback.primaryLight);

  return {
    axis: cssVar('--hooks-colorBorderSecondary', fallback.axis),
    label: cssVar('--hooks-colorTextTertiary', fallback.label),
    text: cssVar('--hooks-colorText', fallback.text),
    tooltipBg: withAlpha(cssVar('--hooks-colorBgElevated', isDark ? '#000000' : '#ffffff'), isDark ? 0.8 : 0.9),
    tooltipBorder: cssVar('--hooks-colorBorderSecondary', fallback.tooltipBorder),
    primary,
    primaryLight,
    track: cssVar('--hooks-colorBorderBox', fallback.track),
    surface: cssVar('--hooks-colorBgBox', fallback.surface),
    colors: seriesColors(cssVar('--hooks-colorPrimary1', primary)),
    fontSize: fallback.fontSize
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
