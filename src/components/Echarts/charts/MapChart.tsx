import type { ECElementEvent } from 'echarts/core';
import { useEffect, useState } from 'react';

import echarts from '../config';
import { useThemedOption } from '../useChartTheme';
import ChartFrame from './ChartFrame';
import { buildMapOption } from './mapOption';
import type { BaseChartProps, MapDatum, MapRegion, MapScatterDatum } from './types';

export interface MapChartProps extends BaseChartProps {
  mapData?: MapDatum[];
  selectedRegion?: string;
  showLabels?: boolean;
  showScatter?: boolean;
  scatterData?: MapScatterDatum[];
  onRegionClick?: (region: MapRegion) => void;
  onRenderComplete?: () => void;
}

const EMPTY_DATA: MapDatum[] = [];
const EMPTY_SCATTER: MapScatterDatum[] = [];

const MapChart = (props: MapChartProps) => {
  const {
    mapData = EMPTY_DATA,
    selectedRegion = '',
    showLabels = true,
    showScatter = true,
    scatterData = EMPTY_SCATTER,
    height = 'calc(100vh - 120px)',
    loading = false,
    isEmpty = false,
    onRegionClick,
    onRenderComplete,
    onClick
  } = props;
  const [regions, setRegions] = useState<MapDatum[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const data = mapData.length ? mapData : regions || EMPTY_DATA;
  const option = useThemedOption(
    theme => buildMapOption(theme, { data, selectedRegion, showLabels, showScatter, scatterData }),
    [data, selectedRegion, showLabels, showScatter, scatterData]
  );

  function handleClick(event: ECElementEvent) {
    onClick?.(event);
    if (event.componentType !== 'series' || event.seriesType !== 'map') return;
    const region = data.find(item => item.name === event.name);
    onRegionClick?.({ name: event.name, adcode: String(region?.adcode ?? ''), level: region?.level || '' });
  }

  useEffect(() => {
    let cancelled = false;
    import('./maps/china.json')
      .then(({ default: geo }) => {
        if (cancelled) return;
        if (!echarts.getMap('china')) echarts.registerMap('china', geo as Parameters<typeof echarts.registerMap>[1]);
        setRegions(
          geo.features.map(feature => ({
            name: feature.properties.name,
            adcode: feature.properties.adcode,
            level: feature.properties.level,
            value: 0
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ChartFrame
      option={option}
      height={height}
      loading={loading || (!regions && !loadError)}
      empty={isEmpty || !regions}
      error={loadError}
      onClick={handleClick}
      onReady={onRenderComplete}
    />
  );
};

export default MapChart;
