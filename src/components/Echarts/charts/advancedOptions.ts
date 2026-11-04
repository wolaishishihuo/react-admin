import type { BarSeriesOption } from 'echarts';

import type { ECOption } from '../config';
import {
  axisLabel,
  axisLine,
  axisTick,
  type ChartTheme,
  colorAt,
  gridWithLegend,
  legendStyle,
  seriesAnimation,
  splitLine,
  tooltipStyle,
  withAlpha
} from '../theme';
import type { DualBarCompareChartProps } from './DualBarCompareChart';
import type { KLineChartProps } from './KLineChart';

export function buildDualBarOption(theme: ChartTheme, props: DualBarCompareChartProps): ECOption {
  const {
    positiveData,
    negativeData,
    xAxisData,
    positiveName = '正向数据',
    negativeName = '负向数据',
    barWidth = 16,
    yAxisMin = -100,
    yAxisMax = 100,
    showDataLabel = false,
    positiveBorderRadius = [10, 10, 0, 0],
    negativeBorderRadius = [0, 0, 10, 10],
    colors,
    showAxisLabel = true,
    showAxisLine = false,
    showSplitLine = false,
    showTooltip = true,
    showLegend = false,
    legendPosition = 'bottom'
  } = props;

  function series(name: string, data: number[], borderRadius: number | number[], negative: boolean): BarSeriesOption {
    return {
      name,
      type: 'bar',
      stack: 'total',
      barWidth,
      barGap: '-100%',
      data,
      itemStyle: { borderRadius, color: colorAt(theme, colors, negative ? 1 : 0) },
      label: {
        show: showDataLabel,
        position: negative ? 'bottom' : 'top',
        color: theme.label,
        fontSize: 12,
        formatter: params => String(negative ? Math.abs(Number(params.value)) : params.value)
      },
      ...seriesAnimation()
    };
  }

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut',
    grid: gridWithLegend(showLegend, legendPosition, { top: showLegend ? 50 : 20, right: 0, left: 0, bottom: 0 }),
    tooltip: showTooltip ? { ...tooltipStyle(theme), axisPointer: { type: 'none' } } : { show: false },
    legend: showLegend ? { ...legendStyle(theme, legendPosition), data: [negativeName, positiveName] } : undefined,
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisTick: axisTick(),
      axisLine: axisLine(theme, showAxisLine),
      axisLabel: axisLabel(theme, showAxisLabel),
      boundaryGap: true
    },
    yAxis: {
      type: 'value',
      min: yAxisMin,
      max: yAxisMax,
      axisLabel: axisLabel(theme, showAxisLabel),
      axisLine: axisLine(theme, showAxisLine),
      splitLine: splitLine(theme, showSplitLine)
    },
    series: [
      series(
        negativeName,
        negativeData.map(value => -Math.abs(value)),
        negativeBorderRadius,
        true
      ),
      series(positiveName, positiveData, positiveBorderRadius, false)
    ]
  };
}

export function buildKLineOption(theme: ChartTheme, props: KLineChartProps): ECOption {
  const { data, colors, showDataZoom = false, dataZoomStart = 0, dataZoomEnd = 100 } = props;
  const up = colorAt(theme, colors, 0);
  const down = colorAt(theme, colors, 1);
  return {
    grid: { top: 20, right: 20, bottom: showDataZoom ? 80 : 20, left: 20, containLabel: true },
    tooltip: {
      ...tooltipStyle(theme),
      axisPointer: { type: 'cross' },
      formatter: params => {
        const item = Array.isArray(params) ? params[0] : params;
        const candle = data[item.dataIndex];
        if (!candle) return '';
        const time = candle.time.replace(
          /[&<>"']/g,
          char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!
        );
        return `<div style="padding:5px"><div><strong>时间：</strong>${time}</div><div><strong>开盘：</strong>${candle.open}</div><div><strong>收盘：</strong>${candle.close}</div><div><strong>最低：</strong>${candle.low}</div><div><strong>最高：</strong>${candle.high}</div></div>`;
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.time),
      axisTick: axisTick(),
      axisLine: axisLine(theme),
      axisLabel: axisLabel(theme)
    },
    yAxis: { type: 'value', scale: true, axisLabel: axisLabel(theme), axisLine: axisLine(theme), splitLine: splitLine(theme) },
    series: [
      {
        type: 'candlestick',
        data: data.map(item => [item.open, item.close, item.low, item.high]),
        itemStyle: { color: up, color0: down, borderColor: up, borderColor0: down, borderWidth: 1 },
        emphasis: { itemStyle: { borderWidth: 2, shadowBlur: 10, shadowColor: withAlpha(theme.shadow, 0.3) } },
        ...seriesAnimation()
      }
    ],
    dataZoom: showDataZoom
      ? [
          { type: 'inside', start: dataZoomStart, end: dataZoomEnd },
          { show: true, type: 'slider', top: '90%', start: dataZoomStart, end: dataZoomEnd }
        ]
      : []
  };
}
