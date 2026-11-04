import type { BarSeriesOption, LineSeriesOption } from 'echarts';
import { SVGRenderer } from 'echarts/renderers';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildDualBarOption, buildKLineOption } from '@/components/Echarts/charts/advancedOptions';
import { buildMapOption } from '@/components/Echarts/charts/mapOption';
import {
  buildBarOption,
  buildLineOption,
  buildMiniDonutOption,
  buildRadarOption,
  buildRingOption,
  buildScatterOption,
  buildSparkLineOption
} from '@/components/Echarts/charts/options';
import echarts, { type ECOption } from '@/components/Echarts/config';
import { applyChartOption } from '@/components/Echarts/renderOption';
import { readChartTheme } from '@/components/Echarts/theme';

const theme = readChartTheme(false);
const flags = {
  showAxisLabel: true,
  showAxisLine: true,
  showSplitLine: true,
  showTooltip: true,
  showLegend: true,
  legendPosition: 'bottom' as const
};
const lineInput = {
  theme,
  data: [
    { name: '销售', data: [5, 10] },
    { name: '利润', data: [2, 4] }
  ],
  xAxisData: ['A', 'B'],
  smooth: true,
  lineWidth: 2.5,
  symbol: 'none' as const,
  symbolSize: 6,
  showAreaColor: true,
  flags
};

afterEach(() => vi.useRealTimers());

describe('Art chart behavior', () => {
  it('uses theme gradients by default and honors custom palettes for single and multiple bars', () => {
    const input = {
      theme,
      data: [1, 2],
      xAxisData: ['A', 'B'],
      barWidth: '40%',
      borderRadius: [4, 4, 0, 0],
      stack: false,
      flags,
      colors: ['red']
    };
    const series = buildBarOption({ ...input, colors: undefined }).series as BarSeriesOption[];
    expect(series[0].itemStyle?.color).toMatchObject({
      colorStops: [
        { offset: 0, color: theme.primaryLight },
        { offset: 1, color: theme.primary }
      ]
    });
    expect(buildBarOption(input).series).toMatchObject([{ itemStyle: { color: 'red' } }]);
    const multiple = buildBarOption({
      ...input,
      data: [
        { name: 'a', data: [1] },
        { name: 'b', data: [2] }
      ]
    }).series as BarSeriesOption[];
    expect(multiple.map(item => item.itemStyle?.color)).toEqual(['red', 'red']);
  });

  it('matches line emphasis, series area configuration and stagger timing without mutating inputs', () => {
    vi.useFakeTimers();
    const setOption = vi.fn();
    const option = buildLineOption(lineInput);
    const series = option.series as LineSeriesOption[];
    expect(series[0].emphasis).toMatchObject({ focus: 'series', lineStyle: { width: 3.5 } });
    const stop = applyChartOption({ setOption } as unknown as ReturnType<typeof echarts.init>, option, 200);
    expect(setOption.mock.calls[0][0].series.map((item: LineSeriesOption) => item.data)).toEqual([
      [0, 0],
      [0, 0]
    ]);
    vi.advanceTimersByTime(100);
    expect(setOption.mock.calls.at(-1)![0].series.map((item: LineSeriesOption) => item.data)).toEqual([
      [5, 10],
      [0, 0]
    ]);
    vi.advanceTimersByTime(200);
    expect(setOption.mock.calls.at(-1)![0].series.map((item: LineSeriesOption) => item.data)).toEqual([
      [5, 10],
      [2, 4]
    ]);
    expect(lineInput.data[0].data).toEqual([5, 10]);
    stop();
  });

  it('includes negative values in line bounds without spreading large arrays', () => {
    expect(buildLineOption({ ...lineInput, data: [-10, 5] }).yAxis).toMatchObject({ min: -10, max: 5 });
    expect(buildLineOption({ ...lineInput, data: [{ name: 'A', data: [-10, -5] }] }).yAxis).toMatchObject({ min: -10, max: 0 });
    expect(buildLineOption({ ...lineInput, data: Array.from({ length: 200000 }, () => -1) }).yAxis).toMatchObject({
      min: -1,
      max: 0
    });
  });

  it('honors per-series area disabling and zero opacity', () => {
    const option = buildLineOption({
      ...lineInput,
      data: [
        { name: 'A', data: [1], showAreaColor: false },
        { name: 'B', data: [2], areaStyle: { startOpacity: 0, endOpacity: 0 } }
      ]
    });
    expect(option.series).toMatchObject([
      { areaStyle: undefined },
      {
        areaStyle: {
          color: { colorStops: [{ color: expect.stringContaining(', 0)') }, { color: expect.stringContaining(', 0)') }] }
        }
      }
    ]);
  });

  it('updates line data directly after the initial reveal and respects disabled animation', () => {
    vi.useFakeTimers();
    const setOption = vi.fn();
    const chart = { setOption } as unknown as ReturnType<typeof echarts.init>;
    const first = buildLineOption(lineInput);
    const next = buildLineOption({ ...lineInput, data: [3, 4] });
    const stop = applyChartOption(chart, next, 200, first);
    expect(setOption).toHaveBeenCalledOnce();
    expect(setOption.mock.calls[0][0].series).toMatchObject([{ data: [3, 4] }]);
    vi.runAllTimers();
    expect(setOption).toHaveBeenCalledOnce();
    stop();
    setOption.mockClear();
    const stopDisabled = applyChartOption(chart, { ...first, animation: false }, 200);
    expect(setOption.mock.calls[0][0].series).toMatchObject(lineInput.data);
    stopDisabled();
  });

  it('aligns ring offsets, radar hover and scatter emphasis in both themes', () => {
    for (const dark of [false, true]) {
      const chartTheme = readChartTheme(dark);
      const ring = buildRingOption({
        theme: chartTheme,
        data: [{ name: 'A', value: 10 }],
        radius: ['50%', '80%'],
        borderRadius: 10,
        centerText: '100',
        showLabel: true,
        showTooltip: true,
        showLegend: true,
        legendPosition: 'right'
      });
      expect(ring.series).toMatchObject([{ center: ['40%', '50%'], emphasis: { label: { show: false } } }]);
      const radar = buildRadarOption({
        theme: chartTheme,
        indicator: [{ name: 'A', max: 10 }],
        data: [{ name: 'A', value: [5] }],
        showTooltip: true,
        showLegend: false,
        legendPosition: 'bottom'
      });
      expect(radar.radar).toMatchObject({ radius: '70%', axisName: { color: chartTheme.radarLabel } });
      expect(radar.series).toMatchObject([{ data: [{ emphasis: { areaStyle: { opacity: 0.25 }, lineStyle: { width: 3 } } }] }]);
      const scatter = buildScatterOption({ theme: chartTheme, data: [{ value: [1, 2] }], symbolSize: 14, flags });
      expect(scatter.series).toMatchObject([{ emphasis: { itemStyle: { shadowBlur: 12 }, scale: true } }]);
    }
  });

  it('normalizes negative bars and preserves OHLC order for candlesticks', () => {
    const dual = buildDualBarOption(theme, { positiveData: [20, 30], negativeData: [10, -5], xAxisData: ['A', 'B'] });
    expect(dual.series).toMatchObject([
      { data: [-10, -5], stack: 'total' },
      { data: [20, 30], stack: 'total' }
    ]);
    const candles = buildKLineOption(theme, {
      data: [{ time: 'A', open: 20, close: 23, high: 25, low: 18 }],
      showDataZoom: true
    });
    expect(candles.series).toMatchObject([{ type: 'candlestick', data: [[20, 23, 18, 25]] }]);
    expect(candles.dataZoom).toHaveLength(2);
  });

  it('matches sparkline gradient tails and donut tracks, and controls map selection', () => {
    const spark = buildSparkLineOption(theme, [1, 2], true);
    expect(spark.series).toMatchObject([
      {
        areaStyle: {
          color: { colorStops: [{ color: expect.stringContaining('0.2') }, { color: expect.stringContaining('0.01') }] }
        }
      }
    ]);
    const donut = buildMiniDonutOption(theme, [70, 30], ['70%', '90%'], undefined, ['2025', '2024']);
    expect(donut.series).toMatchObject([
      { avoidLabelOverlap: false, data: [{ name: '2025' }, { name: '2024', itemStyle: { color: '#e6e8f7' } }] }
    ]);
    const map = buildMapOption(theme, {
      data: [{ name: '北京' }],
      selectedRegion: '北京',
      showLabels: false,
      showScatter: false
    });
    expect(map.series).toMatchObject([{ data: [{ name: '北京', selected: true }], label: { show: false } }]);
    expect(map.series).toHaveLength(1);
  });

  it('only renders map markers supplied by the caller', () => {
    const input = { data: [{ name: '北京' }], selectedRegion: '', showLabels: true, showScatter: true };
    expect(buildMapOption(theme, input).series).toHaveLength(1);
    const marker = { name: '测试区域', value: [110, 30, 5] as [number, number, number] };
    expect(buildMapOption(theme, { ...input, scatterData: [marker] }).series).toMatchObject([
      { type: 'map' },
      { type: 'scatter', data: [marker] }
    ]);
  });
});

describe('real ECharts option updates', () => {
  it('clears area fill and stack, and does not carry a removed series name into single-series mode', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      measureText: (text: string) => ({ width: text.length * 7 })
    } as unknown as CanvasRenderingContext2D);
    echarts.use(SVGRenderer);
    const chart = echarts.init(undefined, undefined, { renderer: 'svg', ssr: true, width: 500, height: 300 });
    try {
      const area = { ...buildLineOption(lineInput), animation: false };
      applyChartOption(chart, area);
      const unfilled = { ...buildLineOption({ ...lineInput, showAreaColor: false }), animation: false };
      applyChartOption(chart, unfilled, undefined, area);
      expect(chart.getOption().series).toMatchObject([{ areaStyle: undefined }, { areaStyle: undefined }]);
      const withoutTooltip = { ...buildLineOption({ ...lineInput, flags: { ...flags, showTooltip: false } }), animation: false };
      applyChartOption(chart, withoutTooltip, undefined, unfilled);
      applyChartOption(chart, area, undefined, withoutTooltip);
      expect(chart.getOption().tooltip).toMatchObject([{ show: true }]);
      const line = { ...buildLineOption({ ...lineInput, data: [2, 4], showAreaColor: false }), animation: false };
      applyChartOption(chart, line, undefined, area);
      expect(chart.getOption().series).toMatchObject([{ areaStyle: undefined }]);
      expect((chart.getOption().series as LineSeriesOption[])[0].name).not.toBe('销售');
      const barInput = {
        theme,
        data: [{ name: 'A', data: [1, 2] }],
        xAxisData: ['A', 'B'],
        barWidth: '40%',
        borderRadius: 0,
        flags
      };
      const stacked = { ...buildBarOption({ ...barInput, stack: true }), animation: false };
      applyChartOption(chart, stacked, undefined, line);
      const unstacked = { ...buildBarOption({ ...barInput, stack: false }), animation: false };
      applyChartOption(chart, unstacked, undefined, stacked);
      expect((chart.getOption().series as BarSeriesOption[])[0].stack).toBeFalsy();
    } finally {
      chart.dispose();
      vi.restoreAllMocks();
    }
  });

  it('removes deleted series and components while retaining legend choices and user zoom', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      measureText: (text: string) => ({ width: text.length * 7 })
    } as unknown as CanvasRenderingContext2D);
    echarts.use(SVGRenderer);
    const chart = echarts.init(undefined, undefined, { renderer: 'svg', ssr: true, width: 500, height: 300 });
    const first: ECOption = {
      animation: false,
      xAxis: { type: 'category', data: ['A', 'B'] },
      yAxis: {},
      legend: {},
      title: { text: 'Old' },
      dataZoom: [{ type: 'inside', start: 0, end: 100 }],
      series: [
        { name: 'A', type: 'bar', data: [1, 2] },
        { name: 'B', type: 'bar', data: [2, 3] }
      ]
    };
    applyChartOption(chart, first);
    chart.dispatchAction({ type: 'legendUnSelect', name: 'A' });
    chart.dispatchAction({ type: 'dataZoom', start: 20, end: 70 });
    const next: ECOption = { ...first, title: [], series: [{ name: 'A', type: 'bar', data: [3, 4] }] };
    applyChartOption(chart, next, undefined, first);
    const resolved = chart.getOption();
    expect(resolved.series).toHaveLength(1);
    expect(resolved.title).toHaveLength(0);
    expect(resolved.legend).toMatchObject([{ selected: { A: false } }]);
    expect(resolved.dataZoom).toMatchObject([{ start: 20, end: 70 }]);
    chart.dispose();
    vi.restoreAllMocks();
  });
});
