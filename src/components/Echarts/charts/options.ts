import type { ECOption } from '../config';
import echarts from '../config';
import {
  axisLabel,
  axisLine,
  axisTick,
  type ChartTheme,
  colorAt,
  gridWithLegend,
  type LegendPosition,
  legendStyle,
  seriesAnimation,
  splitLine,
  tooltipStyle,
  withAlpha
} from '../theme';
import {
  type BarSeries,
  isNamedSeries,
  type LineSeries,
  type PieDatum,
  type RadarIndicator,
  type RadarSeries,
  type ScatterDatum
} from './types';

interface CartesianFlags {
  showAxisLabel: boolean;
  showAxisLine: boolean;
  showSplitLine: boolean;
  showTooltip: boolean;
  showLegend: boolean;
  legendPosition: LegendPosition;
}

function categoryAxes(theme: ChartTheme, labels: string[], flags: CartesianFlags, valueOnX = false) {
  const category = {
    type: 'category' as const,
    data: labels,
    axisTick: axisTick(),
    axisLine: axisLine(theme, flags.showAxisLine),
    axisLabel: axisLabel(theme, flags.showAxisLabel)
  };
  const value = {
    type: 'value' as const,
    axisTick: axisTick(),
    axisLine: axisLine(theme, flags.showAxisLine),
    axisLabel: axisLabel(theme, flags.showAxisLabel),
    splitLine: splitLine(theme, flags.showSplitLine)
  };
  return valueOnX ? { xAxis: value, yAxis: category } : { xAxis: { ...category, boundaryGap: true }, yAxis: value };
}

function verticalGradient(theme: ChartTheme) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: theme.primaryLight },
    { offset: 1, color: theme.primary }
  ]);
}

function horizontalGradient(theme: ChartTheme) {
  return new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: theme.primary },
    { offset: 1, color: theme.primaryLight }
  ]);
}

export function buildBarOption(input: {
  theme: ChartTheme;
  data: number[] | BarSeries[];
  xAxisData: string[];
  barWidth: string | number;
  stack: boolean;
  borderRadius: number | number[];
  horizontal?: boolean;
  flags: CartesianFlags;
  colors?: string[];
}): ECOption {
  const { theme, data, xAxisData, barWidth, stack, borderRadius, horizontal = false, flags, colors } = input;
  const multiple = isNamedSeries(data);
  const showLegend = flags.showLegend && multiple;

  const series = multiple
    ? data.map((item, index) => ({
        name: item.name,
        type: 'bar' as const,
        data: item.data,
        stack: stack ? item.stack || 'total' : undefined,
        barWidth: item.barWidth || barWidth,
        itemStyle: { borderRadius, color: colorAt(theme, colors, index) },
        ...seriesAnimation()
      }))
    : [
        {
          type: 'bar' as const,
          data,
          barWidth,
          itemStyle: {
            borderRadius,
            color: colors?.length ? colorAt(theme, colors, 0) : horizontal ? horizontalGradient(theme) : verticalGradient(theme)
          },
          ...seriesAnimation()
        }
      ];

  return {
    grid: gridWithLegend(showLegend, flags.legendPosition, { top: 15, right: 0, left: 0 }),
    tooltip: flags.showTooltip ? tooltipStyle(theme) : { show: false },
    legend: showLegend ? legendStyle(theme, flags.legendPosition) : undefined,
    ...categoryAxes(theme, xAxisData, flags, horizontal),
    series
  } as ECOption;
}

function areaFill(color: string, start = 0.2, end = 0.02) {
  return {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: withAlpha(color, start) },
      { offset: 1, color: withAlpha(color, end) }
    ])
  };
}

export function buildLineOption(input: {
  theme: ChartTheme;
  data: number[] | LineSeries[];
  xAxisData: string[];
  smooth: boolean;
  lineWidth: number;
  symbol: LineSeries['symbol'];
  symbolSize: number;
  showAreaColor: boolean;
  flags: CartesianFlags;
  colors?: string[];
}): ECOption {
  const { theme, data, xAxisData, smooth, lineWidth, symbol, symbolSize, showAreaColor, flags, colors } = input;
  const multiple = isNamedSeries(data);
  const showLegend = flags.showLegend && multiple;
  let min = 0;
  let max = 0;
  for (const values of multiple ? data.map(item => item.data) : [data as number[]]) {
    for (const value of values) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }

  const series = multiple
    ? data.map((item, index) => {
        const color = colorAt(theme, colors, index);
        const showArea = item.showAreaColor ?? (showAreaColor || Boolean(item.areaStyle));
        return {
          name: item.name,
          type: 'line' as const,
          data: item.data,
          smooth: item.smooth ?? smooth,
          symbol: item.symbol ?? symbol,
          symbolSize: item.symbolSize ?? symbolSize,
          lineStyle: { width: item.lineWidth ?? lineWidth, color },
          itemStyle: { color },
          areaStyle: showArea
            ? (item.areaStyle?.custom ?? areaFill(color, item.areaStyle?.startOpacity ?? 0.2, item.areaStyle?.endOpacity ?? 0.02))
            : undefined,
          emphasis: { focus: 'series' as const, lineStyle: { width: (item.lineWidth ?? lineWidth) + 1 } }
        };
      })
    : [
        {
          type: 'line' as const,
          data,
          smooth,
          symbol,
          symbolSize,
          lineStyle: { width: lineWidth, color: colorAt(theme, colors, 0) },
          itemStyle: { color: colorAt(theme, colors, 0) },
          areaStyle: showAreaColor ? areaFill(colorAt(theme, colors, 0)) : undefined,
          emphasis: { focus: 'series' as const, lineStyle: { width: lineWidth + 1 } }
        }
      ];

  return {
    animationDuration: 1300,
    animationDurationUpdate: 1300,
    grid: gridWithLegend(showLegend, flags.legendPosition, { top: 15, right: 15, left: 0 }),
    tooltip: flags.showTooltip ? tooltipStyle(theme) : { show: false },
    legend: showLegend ? legendStyle(theme, flags.legendPosition) : undefined,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisTick: axisTick(),
      axisLine: axisLine(theme, flags.showAxisLine),
      axisLabel: axisLabel(theme, flags.showAxisLabel)
    },
    yAxis: {
      type: 'value',
      min,
      max,
      axisLabel: axisLabel(theme, flags.showAxisLabel),
      axisLine: axisLine(theme, flags.showAxisLine),
      splitLine: splitLine(theme, flags.showSplitLine)
    },
    series
  } as ECOption;
}

export function buildRingOption(input: {
  theme: ChartTheme;
  data: PieDatum[];
  radius: [string, string];
  borderRadius: number;
  centerText?: string;
  showLabel: boolean;
  showTooltip: boolean;
  showLegend: boolean;
  legendPosition: LegendPosition;
  colors?: string[];
}): ECOption {
  const { theme, data, radius, borderRadius, centerText, showLabel, showTooltip, showLegend, legendPosition, colors } = input;
  const center: [string, string] = !showLegend
    ? ['50%', '50%']
    : legendPosition === 'left'
      ? ['60%', '50%']
      : legendPosition === 'right'
        ? ['40%', '50%']
        : legendPosition === 'top'
          ? ['50%', '60%']
          : ['50%', '40%'];

  return {
    tooltip: showTooltip ? { ...tooltipStyle(theme, 'item'), formatter: '{b}: {c} ({d}%)' } : { show: false },
    legend: showLegend ? legendStyle(theme, legendPosition) : undefined,
    title: centerText
      ? {
          text: centerText,
          left: center[0],
          top: center[1],
          textAlign: 'center',
          textVerticalAlign: 'middle',
          textStyle: { fontSize: 18, fontWeight: 500, color: theme.centerText }
        }
      : undefined,
    series: [
      {
        name: '数据占比',
        type: 'pie',
        radius,
        center,
        avoidLabelOverlap: false,
        itemStyle: { borderRadius, borderColor: theme.surface, borderWidth: 0 },
        label: { show: showLabel, formatter: '{b}\n{d}%', color: theme.pieLabel, fontSize: 12 },
        labelLine: { show: showLabel, length: 15, length2: 25, smooth: true },
        emphasis: { label: { show: false } },
        color: colors?.length ? colors : theme.colors,
        data,
        ...seriesAnimation(),
        animationType: 'expansion'
      }
    ]
  } as ECOption;
}

export function buildScatterOption(input: {
  theme: ChartTheme;
  data: ScatterDatum[];
  symbolSize: number;
  flags: CartesianFlags;
  colors?: string[];
}): ECOption {
  const { theme, data, symbolSize, flags, colors } = input;
  const color = colorAt(theme, colors, 0);
  return {
    grid: { top: 20, right: 20, bottom: 20, left: 20, containLabel: true },
    tooltip: flags.showTooltip
      ? {
          ...tooltipStyle(theme, 'item'),
          formatter: (params: unknown) => {
            const value = (params as { value?: number[] }).value ?? [];
            return `X: ${value[0] ?? '-'}<br/>Y: ${value[1] ?? '-'}`;
          }
        }
      : { show: false },
    xAxis: {
      type: 'value',
      axisLabel: axisLabel(theme, flags.showAxisLabel),
      axisLine: axisLine(theme, flags.showAxisLine),
      axisTick: axisTick(),
      splitLine: splitLine(theme, flags.showSplitLine)
    },
    yAxis: {
      type: 'value',
      axisLabel: axisLabel(theme, flags.showAxisLabel),
      axisLine: axisLine(theme, flags.showAxisLine),
      axisTick: axisTick(),
      splitLine: splitLine(theme, flags.showSplitLine)
    },
    series: [
      {
        type: 'scatter',
        data,
        symbolSize,
        itemStyle: { color, shadowBlur: 6, shadowColor: withAlpha(theme.contrast, 0.1), shadowOffsetY: 2 },
        emphasis: { itemStyle: { shadowBlur: 12, shadowColor: withAlpha(theme.contrast, 0.2) }, scale: true },
        ...seriesAnimation()
      }
    ]
  } as ECOption;
}

export function buildRadarOption(input: {
  theme: ChartTheme;
  indicator: RadarIndicator[];
  data: RadarSeries[];
  showTooltip: boolean;
  showLegend: boolean;
  legendPosition: LegendPosition;
  colors?: string[];
}): ECOption {
  const { theme, indicator, data, showTooltip, showLegend, legendPosition, colors } = input;
  return {
    tooltip: showTooltip ? tooltipStyle(theme, 'item') : { show: false },
    legend: showLegend ? legendStyle(theme, legendPosition) : undefined,
    radar: {
      indicator,
      center: ['50%', '50%'],
      radius: '70%',
      axisName: { color: theme.radarLabel, fontSize: 12 },
      splitLine: { lineStyle: { color: theme.radarGrid } },
      axisLine: { lineStyle: { color: theme.radarGrid } },
      splitArea: {
        show: true,
        areaStyle: { color: [withAlpha(theme.contrast, 0.02), withAlpha(theme.contrast, 0.05)] }
      }
    },
    series: [
      {
        type: 'radar',
        data: data.map((item, index) => {
          const color = colorAt(theme, colors, index);
          return {
            name: item.name,
            value: item.value,
            symbolSize: 4,
            lineStyle: { width: 2, color },
            itemStyle: { color },
            areaStyle: { color, opacity: 0.1 },
            emphasis: { areaStyle: { opacity: 0.25 }, lineStyle: { width: 3 } }
          };
        }),
        ...seriesAnimation(200, 1800)
      }
    ]
  } as ECOption;
}

export function buildSparkLineOption(theme: ChartTheme, data: number[], showArea: boolean, color?: string): ECOption {
  return {
    grid: { top: 0, right: 0, bottom: 0, left: 0 },
    xAxis: { type: 'category', show: false, boundaryGap: false },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data,
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: color || theme.colors[0] },
        areaStyle: showArea ? areaFill(color || theme.primary, 0.2, 0.01) : undefined
      }
    ]
  };
}

export function buildSparkBarOption(theme: ChartTheme, data: number[], barWidth: string, color = theme.colors[0]): ECOption {
  return {
    grid: { top: 0, right: 0, bottom: 15, left: 0 },
    xAxis: { type: 'category', show: false },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'bar',
        data,
        barWidth,
        itemStyle: { color, borderRadius: 2 }
      }
    ]
  };
}

export function buildMiniDonutOption(
  theme: ChartTheme,
  data: [number, number],
  radius: [string, string],
  color = theme.colors[0],
  names: [string?, string?] = []
): ECOption {
  return {
    series: [
      {
        type: 'pie',
        radius,
        avoidLabelOverlap: false,
        label: { show: false },
        data: [
          { name: names[0], value: data[0], itemStyle: { color } },
          { name: names[1], value: data[1], itemStyle: { color: theme.track } }
        ]
      }
    ]
  };
}
