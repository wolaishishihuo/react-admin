import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockMessageError } = vi.hoisted(() => ({
  mockMessageError: vi.fn()
}));

vi.mock('@/hooks/useMessage', () => ({
  message: {
    error: mockMessageError
  }
}));

import http, { clearAuthSession } from '@/apis/http';
import { LOGIN_URL } from '@/config';
import { ResultEnum } from '@/constants';
import { useAuthStore, useTabsStore, useUserStore } from '@/stores';

function make401(config: InternalAxiosRequestConfig) {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, {
    config,
    data: { code: ResultEnum.OVERDUE, msg: 'Unauthorized' },
    headers: {},
    status: 401,
    statusText: 'Unauthorized'
  });
}

function makeOk(config: InternalAxiosRequestConfig, data: unknown) {
  return {
    config,
    data: { code: ResultEnum.SUCCESS, data, msg: 'ok' },
    headers: {},
    status: 200,
    statusText: 'OK'
  };
}

describe('RequestHttp 401 & cancellation lifecycle', () => {
  const originalAdapter = http.service.defaults.adapter;
  const originalRefreshAdapter = http.refreshService.defaults.adapter;
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateSpy = vi.fn();
    window.$navigate = navigateSpy as unknown as typeof window.$navigate;
    mockMessageError.mockReset();

    useUserStore.setState({ token: 'old-token', refreshToken: 'valid-refresh' });
    useAuthStore.setState({
      authMenuList: [{ path: '/home/index' }],
      flatMenuList: [{ path: '/home/index' }],
      showMenuList: [{ path: '/home/index' }],
      authButtons: ['sys:user:create']
    });
    useTabsStore.setState({
      tabsList: [{ icon: 'ri:home-line', title: '首页', path: '/home/index', closable: false }]
    });
  });

  afterEach(() => {
    http.service.defaults.adapter = originalAdapter;
    http.refreshService.defaults.adapter = originalRefreshAdapter;
    http.isRefreshing = false;
    http.refreshTokenQueue = [];
    http.cancelAllRequests();
  });

  it('refreshes token once for concurrent 401 requests and replays them with the new token', async () => {
    const seenAuthHeaders: Record<string, string[]> = { '/a': [], '/b': [] };
    let refreshCount = 0;

    http.service.defaults.adapter = async config => {
      const auth = String(config.headers.get('Authorization') ?? '');
      seenAuthHeaders[config.url!].push(auth);
      if (auth === 'Bearer old-token') {
        throw make401(config);
      }
      return makeOk(config, { url: config.url, auth });
    };

    http.refreshService.defaults.adapter = async config => {
      refreshCount += 1;
      await Promise.resolve();
      return makeOk(config, { accessToken: 'new-token', refreshToken: 'new-refresh' });
    };

    const [resA, resB] = await Promise.all([http.get('/a'), http.get('/b')]);

    expect(refreshCount).toBe(1);
    expect(resA.data).toEqual({ url: '/a', auth: 'Bearer new-token' });
    expect(resB.data).toEqual({ url: '/b', auth: 'Bearer new-token' });
    expect(seenAuthHeaders['/a']).toEqual(['Bearer old-token', 'Bearer new-token']);
    expect(seenAuthHeaders['/b']).toEqual(['Bearer old-token', 'Bearer new-token']);
  });

  it('rejects queued 401 requests without re-sending empty-token requests when refresh fails', async () => {
    const adapterSpy = vi.fn(async (config: InternalAxiosRequestConfig) => {
      throw make401(config);
    });
    http.service.defaults.adapter = adapterSpy;

    http.refreshService.defaults.adapter = async config => {
      await Promise.resolve();
      throw make401(config);
    };

    const results = await Promise.allSettled([http.get('/home/stats'), http.get('/home/chart')]);

    expect(results.every(item => item.status === 'rejected')).toBe(true);
    // Only the initial two requests were sent; queued requests were NEVER re-sent with an empty token
    expect(adapterSpy).toHaveBeenCalledTimes(2);
    expect(useUserStore.getState().token).toBe('');
    expect(useUserStore.getState().refreshToken).toBe('');
    expect(useAuthStore.getState().authMenuList).toEqual([]);
    expect(useAuthStore.getState().authButtons).toEqual([]);
    expect(useTabsStore.getState().tabsList).toEqual([]);
    expect(navigateSpy).toHaveBeenCalledWith(LOGIN_URL, { replace: true });
  });

  it('does not request token refresh when refreshToken is empty', async () => {
    useUserStore.setState({ token: 'old-token', refreshToken: '' });

    const refreshSpy = vi.fn();
    http.refreshService.defaults.adapter = refreshSpy;
    http.service.defaults.adapter = async config => {
      throw make401(config);
    };

    await expect(http.get('/home/stats')).rejects.toThrow();

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(useUserStore.getState().token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(LOGIN_URL, { replace: true });
  });

  it('skips auth refresh and error toast when skipAuthRefresh and silent are enabled', async () => {
    const refreshSpy = vi.fn();
    http.refreshService.defaults.adapter = refreshSpy;
    http.service.defaults.adapter = async config => {
      throw make401(config);
    };

    await expect(http.post('/logout', {}, { silent: true, skipAuthRefresh: true })).rejects.toThrow();

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(mockMessageError).not.toHaveBeenCalled();
    expect(useUserStore.getState().token).toBe('old-token');
  });

  it('aborts in-flight requests silently on cancelAllRequests and allows subsequent requests', async () => {
    http.service.defaults.adapter = config =>
      new Promise((resolve, reject) => {
        const signal = config.signal as AbortSignal | undefined;
        if (config.url === '/slow') {
          const onAbort = () => reject(new axios.CanceledError('aborted', undefined, config));
          if (signal?.aborted) {
            onAbort();
            return;
          }
          signal?.addEventListener('abort', onAbort, { once: true });
          return;
        }
        resolve(makeOk(config, { ok: true }));
      });

    const slowPromise = http.get('/slow');
    await Promise.resolve();
    http.cancelAllRequests();

    await expect(slowPromise).rejects.toSatisfy((err: unknown) => axios.isCancel(err));
    expect(mockMessageError).not.toHaveBeenCalled();

    const nextRes = await http.get('/after-cancel');
    expect(nextRes.data).toEqual({ ok: true });
  });

  it('propagates caller AbortSignal to axios request', async () => {
    const callerController = new AbortController();

    http.service.defaults.adapter = config =>
      new Promise((_, reject) => {
        const signal = config.signal as AbortSignal | undefined;
        const onAbort = () => reject(new axios.CanceledError('caller aborted', undefined, config));
        signal?.addEventListener('abort', onAbort, { once: true });
      });

    const reqPromise = http.get('/query-item', undefined, {
      headers: new AxiosHeaders(),
      signal: callerController.signal
    });
    await Promise.resolve();
    callerController.abort();

    await expect(reqPromise).rejects.toSatisfy((err: unknown) => axios.isCancel(err));
    expect(mockMessageError).not.toHaveBeenCalled();
  });

  it('makes clearAuthSession idempotent when already logged out', () => {
    clearAuthSession();
    clearAuthSession();

    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });

  it('rejects business error codes with an Error instance preserving code', async () => {
    http.service.defaults.adapter = async config => ({
      config,
      data: { code: 40001, data: null, msg: '参数不合法' },
      headers: {},
      status: 200,
      statusText: 'OK'
    });

    await expect(http.get('/bad-biz')).rejects.toMatchObject({
      name: 'ApiError',
      message: '参数不合法',
      code: 40001
    });
    expect(mockMessageError).toHaveBeenCalledWith('参数不合法');
  });

  it('rejects JSON error Blobs on download while allowing ordinary JSON file downloads', async () => {
    http.service.defaults.adapter = async config => {
      if (config.url === '/export-fail') {
        return {
          config,
          data: new Blob([JSON.stringify({ code: 500, msg: '导出数量超限' })], { type: 'application/json' }),
          headers: {},
          status: 200,
          statusText: 'OK'
        };
      }
      return {
        config,
        data: new Blob([JSON.stringify([{ id: 1 }])], { type: 'application/json' }),
        headers: {},
        status: 200,
        statusText: 'OK'
      };
    };

    await expect(http.download('/export-fail')).rejects.toThrow('导出数量超限');
    expect(mockMessageError).toHaveBeenCalledWith('导出数量超限');

    const okBlob = await http.download('/export-json-file');
    expect(okBlob).toBeInstanceOf(Blob);
    expect(okBlob.type).toBe('application/json');
  });

  it('uses backend msg for 4xx errors but hides raw backend msg on 5xx errors', async () => {
    http.service.defaults.adapter = async config => {
      if (config.url === '/client-err') {
        throw new AxiosError('Bad Request', 'ERR_BAD_REQUEST', config, undefined, {
          config,
          data: { msg: '手机号已存在' },
          headers: {},
          status: 400,
          statusText: 'Bad Request'
        });
      }
      throw new AxiosError('Internal Server Error', 'ERR_BAD_RESPONSE', config, undefined, {
        config,
        data: { msg: 'java.sql.SQLException: internal stack' },
        headers: {},
        status: 500,
        statusText: 'Internal Server Error'
      });
    };

    await expect(http.post('/client-err')).rejects.toThrow();
    expect(mockMessageError).toHaveBeenLastCalledWith('手机号已存在');

    await expect(http.post('/server-err')).rejects.toThrow();
    expect(mockMessageError).toHaveBeenLastCalledWith('服务异常！');
  });

  it('preserves axiosConfig.params when params argument is omitted and does not navigate to /500 on network error', async () => {
    let capturedParams: unknown;
    http.service.defaults.adapter = async config => {
      capturedParams = config.params;
      if (config.url === '/offline') {
        throw new AxiosError('Network Error', 'ERR_NETWORK', config);
      }
      return makeOk(config, { ok: true });
    };

    await http.get('/with-config-params', undefined, { params: { page: 2 } });
    expect(capturedParams).toEqual({ page: 2 });

    await expect(http.get('/offline')).rejects.toThrow();
    expect(mockMessageError).toHaveBeenCalledWith('网络错误！请您稍后重试');
    expect(navigateSpy).not.toHaveBeenCalledWith('/500');
  });
});
