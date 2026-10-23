import { describe, expect, it } from 'vitest';

import {
  axisLine,
  type ChartTheme,
  gridWithLegend,
  legendStyle,
  readChartTheme,
  splitLine,
  tooltipStyle,
  withAlpha
} from '@/components/Echarts/theme';

const theme: ChartTheme = {
  axis: '#EDEDED',
  label: '#999999',
  text: '#333333',
  tooltipBg: 'rgba(255, 255, 255, 0.9)',
  tooltipBorder: '#dddddd',
  primary: '#1677ff',
  primaryLight: '#91caff',
  track: '#dbdfe1',
  surface: '#ffffff',
  colors: ['#1677ff'],
  fontSize: 13
};

describe('chart theme', () => {
  it('turns hex into rgba without throwing', () => {
    expect(withAlpha('#1677ff', 0.2)).toBe('rgba(22, 119, 255, 0.2)');
    expect(withAlpha('rgb(22, 119, 255)', 0.02)).toBe('rgba(22, 119, 255, 0.02)');
    expect(withAlpha('not-a-color', 0.5)).toBe('not-a-color');
  });

  it('builds dashed split lines and a bottom legend gap', () => {
    expect(axisLine(theme).lineStyle.color).toBe('#EDEDED');
    expect(splitLine(theme).lineStyle).toMatchObject({ color: '#EDEDED', type: 'dashed' });
    expect(gridWithLegend(true, 'bottom', { top: 15, left: 0 }).bottom).toBe(40);
    expect(gridWithLegend(false, 'bottom').bottom).toBe(8);
    expect(legendStyle(theme, 'bottom').icon).toBe('roundRect');
  });

  it('reads the border token that the card shell uses', () => {
    document.documentElement.style.setProperty('--hooks-colorBorderSecondary', '#123456');
    document.documentElement.style.setProperty('--hooks-colorPrimary', '#B40006');
    document.documentElement.style.setProperty('--hooks-colorPrimary1', '#C41A1A');
    document.documentElement.style.setProperty('--hooks-colorSuccess', '#00ff00');
    const chartTheme = readChartTheme(false);
    expect(chartTheme.axis).toBe('#123456');
    expect(chartTheme.primary).toBe('#B40006');
    expect(chartTheme.colors).toEqual(['#C41A1A', '#4ABEFF', '#EDF2FF', '#14DEBA', '#FFAF20', '#FA8A6C', '#FFAF20']);
    expect(tooltipStyle(readChartTheme(false), 'item').trigger).toBe('item');
  });
});
