import type { LineSeriesOption } from 'echarts';
import type { EChartsType } from 'echarts/core';

import type { ECOption } from './config';

const UPDATE_OPTIONS = {
  replaceMerge: ['series', 'xAxis', 'yAxis', 'radar', 'geo', 'legend', 'title', 'dataZoom', 'graphic']
};

/** 返回清理函数，更新数据、隐藏 Activity 和卸载时取消旧动画。 */
export function applyChartOption(chart: EChartsType, input: ECOption, seriesDelay?: number, previous?: ECOption) {
  const option = componentIds(preserveZoom(input, previous));
  const timers: ReturnType<typeof setTimeout>[] = [];
  let frame = 0;
  if (previous || option.animation === false || seriesDelay === undefined || !Array.isArray(option.series)) {
    chart.setOption(option, UPDATE_OPTIONS);
  } else {
    const series = option.series as LineSeriesOption[];
    const animated: LineSeriesOption[] = series.map(item => ({ ...item, data: item.data?.map(() => 0) }));
    chart.setOption({ ...option, animationDuration: 0, animationDurationUpdate: 0, series: animated }, UPDATE_OPTIONS);
    function reveal(index: number) {
      animated[index] = series[index];
      chart.setOption({ ...option, series: [...animated] }, UPDATE_OPTIONS);
    }
    if (series.length === 1) frame = requestAnimationFrame(() => reveal(0));
    else series.forEach((_, index) => timers.push(setTimeout(() => reveal(index), index * seriesDelay + 100)));
  }
  return () => {
    timers.forEach(clearTimeout);
    cancelAnimationFrame(frame);
  };
}

function componentIds(option: ECOption): ECOption {
  const result = { ...option } as Record<string, unknown>;
  for (const key of UPDATE_OPTIONS.replaceMerge) {
    const value = result[key];
    if (value === undefined || value === null) continue;
    const items = Array.isArray(value) ? value : [value];
    result[key] = items.map((item: Record<string, unknown>, index: number) => ({
      ...item,
      id: item.id ?? (key === 'series' ? `chart-series-${item.type ?? ''}-${item.name ?? ''}-${index}` : `chart-${key}-${index}`)
    }));
  }
  return result as ECOption;
}

function preserveZoom(option: ECOption, previous?: ECOption): ECOption {
  if (!Array.isArray(option.dataZoom) || !Array.isArray(previous?.dataZoom)) return option;
  const oldZoom = previous.dataZoom;
  return {
    ...option,
    dataZoom: option.dataZoom.map((zoom, index) => {
      const old = oldZoom[index];
      if (!old || zoom.start !== old.start || zoom.end !== old.end) return zoom;
      const rest = { ...zoom };
      delete rest.start;
      delete rest.end;
      return rest;
    })
  };
}
