import { render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { EChartsRef } from '@/components/ECharts';

const chart = {
  on: vi.fn(),
  off: vi.fn(),
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn()
};

const echartsMock = {
  getInstanceByDom: vi.fn(),
  init: vi.fn(() => chart)
};

vi.mock('@/components/ECharts/config', () => ({
  default: echartsMock
}));

class ResizeObserverMock {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    observers.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {
    observers = observers.filter(item => item !== this);
  }
  trigger() {
    this.callback([], this);
  }
}

let observers: ResizeObserverMock[] = [];

describe('ECharts', () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    echartsMock.init.mockClear();
    echartsMock.getInstanceByDom.mockReturnValue(undefined);
    chart.on.mockClear();
    chart.off.mockClear();
    chart.setOption.mockClear();
    chart.resize.mockClear();
    chart.dispose.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('零尺寸时不初始化，尺寸就绪后只 init 一次', async () => {
    const { default: ECharts } = await import('@/components/ECharts');
    const view = render(<ECharts option={{ title: { text: 'a' } }} width={0} height={0} />);
    const el = view.container.firstElementChild as HTMLDivElement;
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 0 });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 0 });
    observers[0]?.trigger();
    expect(echartsMock.init).not.toHaveBeenCalled();

    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 120 });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 80 });
    observers[0]?.trigger();
    observers[0]?.trigger();
    expect(echartsMock.init).toHaveBeenCalledTimes(1);
  });

  it('option、click、resize、主题变化和 unmount dispose', async () => {
    const { default: ECharts } = await import('@/components/ECharts');
    const onClick = vi.fn();
    const ref = createRef<EChartsRef>();
    const view = render(<ECharts ref={ref} option={{ title: { text: 'light' } }} width={200} height={120} onClick={onClick} />);
    const el = view.container.firstElementChild as HTMLDivElement;
    Object.defineProperty(el, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(el, 'clientHeight', { configurable: true, value: 120 });
    observers[0]?.trigger();

    expect(ref.current?.instance()).toBe(chart);
    expect(chart.setOption).toHaveBeenCalled();

    const clickHandler = chart.on.mock.calls.find(call => call[0] === 'click')?.[1] as ((event: unknown) => void) | undefined;
    clickHandler?.({ type: 'click' });
    expect(onClick).toHaveBeenCalled();

    view.rerender(<ECharts ref={ref} option={{ title: { text: 'dark' } }} width={200} height={120} onClick={onClick} />);
    expect(chart.setOption).toHaveBeenCalledTimes(2);

    observers[0]?.trigger();
    await waitFor(() => expect(chart.resize).toHaveBeenCalled());

    view.unmount();
    expect(chart.dispose).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeNull();
  });
});
