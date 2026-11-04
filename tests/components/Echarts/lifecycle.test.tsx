import { act, cleanup, render } from '@testing-library/react';
import { Activity, StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ECharts from '@/components/Echarts';
import MetricChartCard from '@/components/Echarts/cards/MetricChartCard';
import BarChart from '@/components/Echarts/charts/BarChart';
import ChartFrame from '@/components/Echarts/charts/ChartFrame';
import DualBarCompareChart from '@/components/Echarts/charts/DualBarCompareChart';
import KLineChart from '@/components/Echarts/charts/KLineChart';
import LineChart from '@/components/Echarts/charts/LineChart';
import RadarChart from '@/components/Echarts/charts/RadarChart';
import RingChart from '@/components/Echarts/charts/RingChart';
import ScatterChart from '@/components/Echarts/charts/ScatterChart';

const mocked = vi.hoisted(() => ({
  init: vi.fn(() => ({
    setOption: vi.fn((...args: unknown[]) => {
      void args;
    }),
    clear: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn((...args: unknown[]) => {
      void args;
    }),
    off: vi.fn(),
    getWidth: () => 400,
    getHeight: () => 256
  }))
}));
vi.mock('@/components/Echarts/config', async importOriginal => {
  const actual = await importOriginal<typeof import('@/components/Echarts/config')>();
  return { ...actual, default: { ...actual.default, init: mocked.init } };
});

let intersect: IntersectionObserverCallback;
let resized: ResizeObserverCallback;
let rectangle: DOMRect;
const disconnectIntersection = vi.fn();
const disconnectResize = vi.fn();
const option = { xAxis: {}, yAxis: {}, series: [{ type: 'line' as const, data: [5, 10] }] };

beforeEach(() => {
  vi.useFakeTimers();
  mocked.init.mockClear();
  rectangle = { width: 400, height: 256, top: 0, left: 0, right: 400, bottom: 256, x: 0, y: 0, toJSON: () => ({}) };
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => rectangle);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }
      observe = vi.fn();
      disconnect = disconnectIntersection;
    }
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resized = callback;
      }
      observe = vi.fn();
      disconnect = disconnectResize;
    }
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('ECharts lifecycle', () => {
  it('defers an offscreen/zero-size chart and uses the newest pending option when it becomes visible', () => {
    rectangle = { ...rectangle, width: 0 };
    const view = render(<ECharts option={option} />);
    expect(mocked.init).not.toHaveBeenCalled();
    const next = { ...option, series: [{ type: 'line' as const, data: [20, 30] }] };
    view.rerender(<ECharts option={next} />);
    rectangle = { ...rectangle, width: 400, top: innerHeight + 1, bottom: innerHeight + 257 };
    act(() => intersect([], {} as IntersectionObserver));
    expect(mocked.init).not.toHaveBeenCalled();
    rectangle = { ...rectangle, top: 0, bottom: 256 };
    act(() => intersect([], {} as IntersectionObserver));
    expect(mocked.init).toHaveBeenCalledTimes(1);
    expect(mocked.init.mock.results[0].value.setOption.mock.calls[0][0]).toMatchObject(next);
  });

  it('resizes for container changes and calls the current click callback', () => {
    const first = vi.fn();
    const second = vi.fn();
    const view = render(<ECharts option={option} onClick={first} />);
    const chart = mocked.init.mock.results[0].value;
    view.rerender(<ECharts option={option} onClick={second} />);
    const click = chart.on.mock.calls[0][1] as (event: unknown) => void;
    click({ name: 'updated' });
    expect(second).toHaveBeenCalledWith({ name: 'updated' });
    expect(first).not.toHaveBeenCalled();
    rectangle = { ...rectangle, width: 600 };
    act(() => {
      resized([], {} as ResizeObserver);
      vi.advanceTimersByTime(20);
    });
    expect(chart.resize).toHaveBeenCalledOnce();
  });

  it('changes automatic resizing without disposing the current chart', () => {
    const view = render(<ECharts option={option} />);
    const chart = mocked.init.mock.results[0].value;
    view.rerender(<ECharts option={option} isResize={false} />);
    rectangle = { ...rectangle, width: 600 };
    act(() => {
      resized([], {} as ResizeObserver);
      vi.advanceTimersByTime(20);
    });
    expect(chart.resize).not.toHaveBeenCalled();
    expect(chart.dispose).not.toHaveBeenCalled();
    view.rerender(<ECharts option={option} isResize />);
    expect(chart.resize).toHaveBeenCalledOnce();
    expect(mocked.init).toHaveBeenCalledOnce();
  });

  it('initializes after a zero-size container becomes measurable even with automatic resizing disabled', () => {
    rectangle = { ...rectangle, width: 0 };
    render(<ECharts option={option} isResize={false} />);
    expect(mocked.init).not.toHaveBeenCalled();
    rectangle = { ...rectangle, width: 400 };
    act(() => {
      resized([], {} as ResizeObserver);
      vi.advanceTimersByTime(20);
    });
    expect(mocked.init).toHaveBeenCalledOnce();
  });

  it('cancels pending reveal timers when newer data arrives', () => {
    const first = { ...option, series: [...option.series, { type: 'line' as const, data: [1, 2] }] };
    const view = render(<ECharts option={first} seriesDelay={200} />);
    const chart = mocked.init.mock.results[0].value;
    const next = { ...option, series: [{ type: 'line' as const, data: [30, 40] }] };
    view.rerender(<ECharts option={next} seriesDelay={200} />);
    expect(chart.setOption.mock.calls.at(-1)![0]).toMatchObject(next);
    const calls = chart.setOption.mock.calls.length;
    act(() => vi.advanceTimersByTime(1000));
    expect(chart.setOption).toHaveBeenCalledTimes(calls);
  });

  it('disposes and recreates resources across Activity hiding and StrictMode remounts', () => {
    const view = render(
      <StrictMode>
        <Activity mode='visible'>
          <ECharts option={option} seriesDelay={200} />
        </Activity>
      </StrictMode>
    );
    const chart = mocked.init.mock.results.at(-1)!.value;
    view.rerender(
      <StrictMode>
        <Activity mode='hidden'>
          <ECharts option={option} seriesDelay={200} />
        </Activity>
      </StrictMode>
    );
    expect(chart.dispose).toHaveBeenCalledOnce();
    const calls = chart.setOption.mock.calls.length;
    act(() => vi.advanceTimersByTime(2000));
    expect(chart.setOption).toHaveBeenCalledTimes(calls);
    view.rerender(
      <StrictMode>
        <Activity mode='visible'>
          <ECharts option={option} seriesDelay={200} />
        </Activity>
      </StrictMode>
    );
    expect(mocked.init.mock.results.at(-1)!.value).not.toBe(chart);
    view.unmount();
    expect(disconnectIntersection).toHaveBeenCalled();
    expect(disconnectResize).toHaveBeenCalled();
  });

  it('keeps the frame, empty state and loading mask available without creating a chart', () => {
    const view = render(<ChartFrame option={option} height='20rem' empty loading />);
    expect(view.getByText('暂无数据')).toBeInTheDocument();
    expect(view.getByLabelText('图表加载中')).toBeInTheDocument();
    expect(view.container.firstChild).toHaveStyle({ height: '320px' });
    expect(mocked.init).not.toHaveBeenCalled();
    view.rerender(<ChartFrame option={option} empty={false} loading={false} />);
    expect(mocked.init).toHaveBeenCalledOnce();
  });

  it('shows a loading failure separately from an empty data set', () => {
    const view = render(<ChartFrame option={option} empty error />);
    expect(view.getByRole('alert')).toHaveTextContent('图表加载失败');
    expect(view.queryByText('暂无数据')).not.toBeInTheDocument();
    expect(mocked.init).not.toHaveBeenCalled();
  });
});

describe('chart data semantics', () => {
  it.each([
    ['bar', <BarChart data={[0, 0]} />],
    ['line', <LineChart data={[0, 0]} />],
    ['scatter', <ScatterChart data={[{ value: [0, 0] }]} />],
    ['radar', <RadarChart indicator={[{ name: 'A', max: 10 }]} data={[{ name: 'A', value: [0] }]} />],
    ['candlestick', <KLineChart data={[{ time: 'A', open: 0, close: 0, high: 0, low: 0 }]} />],
    ['metric', <MetricChartCard value={0} label='数量' percentage={0} chart='line' data={[0, 0]} />]
  ])('renders valid zero values in a %s chart', (_, chart) => {
    const view = render(chart);
    expect(view.queryByText('暂无数据')).not.toBeInTheDocument();
    expect(mocked.init).toHaveBeenCalledOnce();
  });

  it('distinguishes empty series from zero values and supports an explicit empty state', () => {
    const view = render(<BarChart data={[{ name: 'A', data: [] }]} />);
    expect(view.getByText('暂无数据')).toBeInTheDocument();
    view.rerender(<BarChart data={[0]} />);
    expect(view.queryByText('暂无数据')).not.toBeInTheDocument();
    view.rerender(<BarChart data={[0]} isEmpty />);
    expect(view.getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders a comparison when only one side has observations', () => {
    const view = render(<DualBarCompareChart positiveData={[0, 10]} negativeData={[]} xAxisData={['A', 'B']} />);
    expect(view.queryByText('暂无数据')).not.toBeInTheDocument();
    expect(mocked.init).toHaveBeenCalledOnce();
  });

  it('keeps a zero-total ring empty because it has no proportions to display', () => {
    const view = render(
      <RingChart
        data={[
          { name: 'A', value: 0 },
          { name: 'B', value: 0 }
        ]}
      />
    );
    expect(view.getByText('暂无数据')).toBeInTheDocument();
    expect(mocked.init).not.toHaveBeenCalled();
  });
});
