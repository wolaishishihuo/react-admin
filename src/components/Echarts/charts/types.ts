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
  showAreaColor?: boolean;
  areaStyle?: { startOpacity?: number; endOpacity?: number };
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

export interface AxisChartProps {
  height?: string;
  colors?: string[];
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

export function isBarLikeEmpty(data: number[] | { data: number[] }[]) {
  if (!data.length) return true;
  if (typeof data[0] === 'number') return (data as number[]).every(value => value === 0);
  return (data as { data: number[] }[]).every(item => !item.data.length || item.data.every(value => value === 0));
}
