import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  expireSession,
  refreshToken,
  registerTokenRefreshHandler,
  registerUnauthorizedHandler,
  resetTokenRefresh
} from '@/services/http/unauthorized';

afterEach(() => {
  resetTokenRefresh();
  registerTokenRefreshHandler(null);
  vi.useRealTimers();
});

describe('expireSession', () => {
  it('并发 401 只执行一次 handler', async () => {
    const handler = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    registerUnauthorizedHandler(handler);
    await Promise.all([expireSession(), expireSession(), expireSession()]);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('refreshToken', () => {
  it('未注册刷新能力时返回 false', async () => {
    await expect(refreshToken()).resolves.toBe(false);
  });

  it('并发刷新共用同一个请求', async () => {
    let resolveRefresh!: (success: boolean) => void;
    const handler = vi.fn(
      () =>
        new Promise<boolean>(resolve => {
          resolveRefresh = resolve;
        })
    );
    registerTokenRefreshHandler(handler);

    const first = refreshToken();
    const second = refreshToken();
    resolveRefresh(true);

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('刷新完成后一秒内复用结果', async () => {
    vi.useFakeTimers();
    const handler = vi.fn().mockResolvedValue(true);
    registerTokenRefreshHandler(handler);

    await refreshToken();
    await refreshToken();
    expect(handler).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(1000);
    await refreshToken();
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
