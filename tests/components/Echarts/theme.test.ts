import { describe, expect, it } from 'vitest';

import {
  axisLine,
  chartPrimaryTokens,
  type ChartTheme,
  gridWithLegend,
  legendStyle,
  readChartTheme,
  splitLine,
  tooltipStyle,
  withAlpha
} from '@/components/Echarts/theme';

const theme: ChartTheme = readChartTheme(false);

describe('chart theme', () => {
  it('turns hex into rgba without throwing', () => {
    expect(withAlpha('#1677ff', 0.2)).toBe('rgba(22, 119, 255, 0.2)');
    expect(withAlpha('rgb(22, 119, 255)', 0.02)).toBe('rgba(22, 119, 255, 0.02)');
    expect(withAlpha('not-a-color', 0.5)).toBe('not-a-color');
  });

  it('matches Art floor rounding and dark primary shades', () => {
    expect(chartPrimaryTokens('#5D87FF', false)).toEqual({
      '--hooks-chartPrimary': '#5D87FF',
      '--hooks-chartPrimaryLight': '#9db7ff',
      '--hooks-chartSeriesPrimary': '#6d93ff'
    });
    expect(chartPrimaryTokens('#5D87FF', true)).toEqual({
      '--hooks-chartPrimary': '#5D87FF',
      '--hooks-chartPrimaryLight': '#375199',
      '--hooks-chartSeriesPrimary': '#5379e5'
    });
  });

  it('builds dashed split lines and a bottom legend gap', () => {
    expect(axisLine(theme).lineStyle.color).toBe('#EDEDED');
    expect(splitLine(theme).lineStyle).toMatchObject({ color: '#EDEDED', type: 'dashed' });
    expect(gridWithLegend(true, 'bottom', { top: 15, left: 0 }).bottom).toBe(40);
    expect(gridWithLegend(false, 'bottom').bottom).toBe(8);
    expect(legendStyle(theme, 'bottom').icon).toBe('roundRect');
  });

  it('keeps Art chart tokens independent from antd component tokens', () => {
    document.documentElement.style.setProperty('--hooks-colorBorderSecondary', '#123456');
    document.documentElement.style.setProperty('--hooks-colorPrimary', '#B40006');
    document.documentElement.style.setProperty('--hooks-chartSeriesPrimary', '#C41A1A');
    document.documentElement.style.setProperty('--hooks-colorSuccess', '#00ff00');
    const chartTheme = readChartTheme(false);
    expect(chartTheme.axis).toBe('#EDEDED');
    document.documentElement.style.setProperty('--hooks-chartAxis', '#abcdef');
    expect(readChartTheme(false).axis).toBe('#abcdef');
    document.documentElement.removeAttribute('style');
    expect(chartTheme.primary).toBe('#B40006');
    expect(chartTheme.colors).toEqual(['#C41A1A', '#4ABEFF', '#EDF2FF', '#14DEBA', '#FFAF20', '#FA8A6C', '#FFAF20']);
    expect(tooltipStyle(readChartTheme(false), 'item').trigger).toBe('item');
  });
});
