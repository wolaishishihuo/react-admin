import type { LineSeriesOption } from 'echarts';
import type { ECElementEvent } from 'echarts/core';

import type { LegendPosition } from '../theme';

export interface BarSeries {
  name: string;
  data: number[];
  barWidth?: string | number;
  stack?: string;
}

export interface LineSeries {
  name: string;
  data: number[];
  smooth?: boolean;
  lineWidth?: number;
  symbol?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none';
  symbolSize?: number;
  showAreaColor?: boolean;
  areaStyle?: { startOpacity?: number; endOpacity?: number; custom?: LineSeriesOption['areaStyle'] };
}

export interface PieDatum {
  name: string;
  value: number;
}

export interface ScatterDatum {
  value: number[];
}

export interface RadarIndicator {
  name: string;
  max: number;
}

export interface RadarSeries {
  name: string;
  value: number[];
}

export interface BaseChartProps {
  height?: number | string;
  colors?: string[];
  loading?: boolean;
  /** 强制显示空态；默认按图表类型判断是否存在可展示的数据。 */
  isEmpty?: boolean;
  onClick?: (event: ECElementEvent) => void;
}

export interface AxisChartProps extends BaseChartProps {
  showAxisLabel?: boolean;
  showAxisLine?: boolean;
  showSplitLine?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
}

export function isNamedSeries<T extends { name: string; data: number[] }>(data: number[] | T[]): data is T[] {
  return data.length > 0 && typeof data[0] === 'object';
}

export function isSeriesEmpty(data: number[] | { data: number[] }[]) {
  if (!data.length) return true;
  return typeof data[0] !== 'number' && (data as { data: number[] }[]).every(item => !item.data.length);
}

export interface CandlestickDatum {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface MapDatum {
  name: string;
  value?: number;
  adcode?: string | number;
  level?: string;
  selected?: boolean;
}

export interface MapRegion {
  name: string;
  adcode: string;
  level: string;
}

export interface MapScatterDatum {
  name: string;
  value: [longitude: number, latitude: number] | [longitude: number, latitude: number, value: number];
}
