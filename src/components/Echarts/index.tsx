import { useLatest } from 'ahooks';
import type { ECElementEvent, EChartsType } from 'echarts/core';
import React, { type ForwardedRef, useEffect, useImperativeHandle, useRef } from 'react';

import echarts, { type ECOption } from './config';
import { applyChartOption } from './renderOption';

export interface EChartProps {
  option: ECOption | null | undefined;
  isResize?: boolean;
  width?: number | string;
  height?: number | string;
  /** 折线从零值升起，多系列按此间隔依次开始。 */
  seriesDelay?: number;
  onClick?: (event: ECElementEvent) => void;
  onReady?: (chart: EChartsType) => void;
}

export interface EChartsRef {
  instance(): EChartsType | undefined;
}

const EChartInner = (props: EChartProps, ref: ForwardedRef<EChartsRef>) => {
  const { option, isResize = true, width = '100%', height = '100%', seriesDelay } = props;
  const element = useRef<HTMLDivElement>(null);
  const instance = useRef<EChartsType | undefined>(undefined);
  const update = useRef<(() => void) | undefined>(undefined);
  const latest = useLatest(props);

  useImperativeHandle(ref, () => ({ instance: () => instance.current }), []);

  useEffect(() => {
    const container = element.current!;
    let disposed = false;
    let appliedOption: EChartProps['option'];
    let appliedDelay: number | undefined;
    let stopAnimation: (() => void) | undefined;
    let resizeFrame = 0;

    function handleClick(event: ECElementEvent) {
      latest.current.onClick?.(event);
    }

    function render() {
      if (disposed) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      if (!instance.current && (rect.bottom <= 0 || rect.right <= 0 || rect.top >= innerHeight || rect.left >= innerWidth))
        return;
      const created = !instance.current;
      if (!instance.current) {
        instance.current = echarts.init(container);
        instance.current.on('click', handleClick);
      } else if (
        latest.current.isResize !== false &&
        (instance.current.getWidth() !== rect.width || instance.current.getHeight() !== rect.height)
      ) {
        instance.current.resize();
      }
      const next = latest.current;
      if (next.option !== appliedOption || next.seriesDelay !== appliedDelay) {
        stopAnimation?.();
        if (next.option)
          stopAnimation = applyChartOption(instance.current, next.option, next.seriesDelay, appliedOption || undefined);
        else instance.current.clear();
        appliedOption = next.option;
        appliedDelay = next.seriesDelay;
      }
      if (created) latest.current.onReady?.(instance.current);
    }

    function requestResize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(render);
    }

    update.current = render;
    const visibilityObserver = new IntersectionObserver(render, { threshold: 0.1 });
    const sizeObserver = new ResizeObserver(requestResize);
    visibilityObserver.observe(container);
    sizeObserver.observe(container);
    render();

    return () => {
      disposed = true;
      update.current = undefined;
      visibilityObserver.disconnect();
      sizeObserver.disconnect();
      cancelAnimationFrame(resizeFrame);
      stopAnimation?.();
      instance.current?.off('click', handleClick);
      instance.current?.dispose();
      instance.current = undefined;
    };
  }, [latest]);

  useEffect(() => {
    update.current?.();
  }, [option, seriesDelay, width, height, isResize]);

  return <div ref={element} style={{ height, width, minWidth: 0, flex: 1 }} />;
};

const ECharts = React.memo(React.forwardRef(EChartInner));

export default ECharts;
