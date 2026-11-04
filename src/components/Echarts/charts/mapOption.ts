import echarts, { type ECOption } from '../config';
import { type ChartTheme, MAP_COLORS, tooltipStyle } from '../theme';
import type { MapDatum, MapScatterDatum } from './types';

interface MapOptionInput {
  data: MapDatum[];
  selectedRegion: string;
  showLabels: boolean;
  showScatter: boolean;
  scatterData?: MapScatterDatum[];
}

export function buildMapOption(theme: ChartTheme, input: MapOptionInput): ECOption {
  const { data, selectedRegion, showLabels, showScatter, scatterData = [] } = input;
  const emphasis = {
    label: { show: showLabels, color: MAP_COLORS.white, fontSize: 12 },
    itemStyle: { areaColor: MAP_COLORS.hover, borderColor: MAP_COLORS.white, borderWidth: 3 }
  };
  return {
    animation: false,
    tooltip: {
      ...tooltipStyle({ ...theme, text: theme.map.label }, 'item'),
      formatter: params => {
        const item = Array.isArray(params) ? params[0] : params;
        const region = data.find(entry => entry.name === item.name);
        const encode = echarts.format.encodeHTML;
        return `<div style="padding:8px"><div><strong>名称:</strong> ${encode(item.name || '未知区域')}</div><div><strong>代码:</strong> ${encode(String(region?.adcode ?? '暂无'))}</div><div><strong>级别:</strong> ${encode(region?.level || '暂无')}</div></div>`;
      }
    },
    geo: {
      map: 'china',
      zoom: 1,
      show: true,
      roam: false,
      scaleLimit: { min: 0.8, max: 3 },
      layoutSize: '100%',
      emphasis,
      itemStyle: {
        borderColor: theme.map.border,
        borderWidth: 2,
        shadowColor: theme.map.shadow,
        shadowOffsetX: 2,
        shadowOffsetY: 15,
        shadowBlur: 15
      }
    },
    series: [
      {
        type: 'map',
        map: 'china',
        aspectScale: 0.75,
        zoom: 1,
        selectedMode: 'single',
        label: { show: showLabels, color: MAP_COLORS.white, fontSize: 10 },
        itemStyle: {
          borderColor: MAP_COLORS.border,
          borderWidth: 2,
          areaColor: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: MAP_COLORS.start },
              { offset: 1, color: MAP_COLORS.end }
            ]
          },
          shadowColor: MAP_COLORS.shadow,
          shadowOffsetY: 15,
          shadowBlur: 20
        },
        emphasis,
        select: {
          label: { show: showLabels, color: MAP_COLORS.white, fontWeight: 'bold' },
          itemStyle: { areaColor: MAP_COLORS.selected, borderColor: MAP_COLORS.white, borderWidth: 2 }
        },
        data: data.map(region => ({ ...region, selected: selectedRegion ? region.name === selectedRegion : region.selected }))
      },
      ...(showScatter && scatterData.length
        ? [
            {
              name: '城市',
              type: 'scatter' as const,
              coordinateSystem: 'geo',
              symbol: 'pin',
              symbolSize: 15,
              label: { show: false },
              itemStyle: { color: MAP_COLORS.pin, shadowBlur: 10, shadowColor: MAP_COLORS.pinShadow },
              data: scatterData
            }
          ]
        : [])
    ]
  };
}
