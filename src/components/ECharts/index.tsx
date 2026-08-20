import { useDebounceFn } from 'ahooks';
import type { ECElementEvent, EChartsType } from 'echarts';
import { memo, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type ForwardedRef } from 'react';
import echarts, { type ECOption } from './config';

export interface EChartProps {
  option: ECOption | null | undefined;
  isResize?: boolean;
  width?: number | string;
  height?: number | string;
  onClick?: (event: ECElementEvent) => void;
}

export interface EChartsRef {
  instance(): EChartsType | undefined;
}

function hasSize(el: HTMLElement) {
  return el.clientWidth > 0 && el.clientHeight > 0;
}

const EChartInner = ({ option, isResize = true, width, height, onClick }: EChartProps, ref: ForwardedRef<EChartsRef>) => {
  const cRef = useRef<HTMLDivElement>(null);
  const cInstance = useRef<EChartsType | undefined>(undefined);
  const onClickRef = useRef(onClick);
  const optionRef = useRef(option);
  onClickRef.current = onClick;
  optionRef.current = option;

  const { run: resize } = useDebounceFn(() => cInstance.current?.resize({ animation: { duration: 300 } }), { wait: 100 });

  useEffect(() => {
    const el = cRef.current;
    if (!el) return;

    let disposed = false;
    const handleClick = (event: ECElementEvent) => onClickRef.current?.(event);

    const initOnce = () => {
      if (disposed || cInstance.current || !hasSize(el)) return;
      cInstance.current = echarts.getInstanceByDom(el) ?? echarts.init(el, undefined, { renderer: 'svg' });
      cInstance.current.on('click', handleClick);
      if (optionRef.current) cInstance.current.setOption(optionRef.current);
    };

    initOnce();
    const observer = new ResizeObserver(() => {
      initOnce();
      if (isResize) resize();
    });
    observer.observe(el);

    return () => {
      disposed = true;
      observer.disconnect();
      cInstance.current?.off('click', handleClick);
      cInstance.current?.dispose();
      cInstance.current = undefined;
    };
  }, [isResize, resize]);

  useEffect(() => {
    if (option) cInstance.current?.setOption(option);
  }, [option]);

  useImperativeHandle(ref, () => ({
    instance: () => cInstance.current
  }));

  const echartsStyle = useMemo(
    () => (width || height ? { height, width } : { height: '100%', width: '100%', flex: 1 }),
    [width, height]
  );

  return <div ref={cRef} style={echartsStyle} />;
};

const ECharts = memo(forwardRef(EChartInner));
export default ECharts;
