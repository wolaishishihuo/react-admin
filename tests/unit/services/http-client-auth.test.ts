import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { message } from '@/app/feedback';
import { axiosInstance, handleUnauthorizedResponse } from '@/services/http/client';
import { HttpError } from '@/services/http/errors';
import { registerTokenRefreshHandler, registerUnauthorizedHandler, resetTokenRefresh } from '@/services/http/unauthorized';
import { setRefreshedAuthTokens, useSessionStore } from '@/stores/modules/session.store';

vi.mock('@/app/feedback', () => ({
  message: { error: vi.fn(), success: vi.fn() }
}));

function createConfig(overrides: Partial<InternalAxiosRequestConfig> = {}): InternalAxiosRequestConfig {
  return {
    headers: new AxiosHeaders({ 'x-access-token': 'token-old' }),
    method: 'GET',
    url: '/protected',
    ...overrides
  } as InternalAxiosRequestConfig;
}

function createResponse(config: InternalAxiosRequestConfig, code: number): AxiosResponse {
  return {
    config,
    data: { code, data: code === 200, msg: code === 200 ? '成功' : '令牌已过期' },
    headers: new AxiosHeaders({ 'content-type': 'application/json' }),
    status: 200,
    statusText: 'OK'
  };
}

describe('handleUnauthorizedResponse', () => {
  beforeEach(() => {
    useSessionStore.setState({
      token: 'token-old',
      refreshToken: 'refresh-old',
      sessionEpoch: 0,
      initialized: true,
      lastLoginUserId: ''
    });
    resetTokenRefresh();
    vi.mocked(message.error).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetTokenRefresh();
    registerTokenRefreshHandler(null);
  });

  it('刷新成功后携带新 token 重发原请求一次', async () => {
    const retriedResponse = { data: { code: 200, data: true, msg: '成功' } } as AxiosResponse;
    const requestSpy = vi.spyOn(axiosInstance, 'request').mockResolvedValue(retriedResponse);
    registerTokenRefreshHandler(async () => {
      setRefreshedAuthTokens({ token: 'token-new', refreshToken: 'refresh-new' });
      return true;
    });
    const config = createConfig();

    await expect(handleUnauthorizedResponse(config)).resolves.toBe(retriedResponse);

    expect(config.isTokenRefreshRetry).toBe(true);
    expect(config.headers.get('x-access-token')).toBe('token-new');
    expect(requestSpy).toHaveBeenCalledOnce();
  });

  it('业务信封 401 刷新后通过响应拦截器重放', async () => {
    let callCount = 0;
    const requestTokens: unknown[] = [];
    const adapter: AxiosAdapter = async config => {
      callCount += 1;
      requestTokens.push(config.headers.get('x-access-token'));
      return createResponse(config, callCount === 1 ? 401 : 200);
    };
    registerTokenRefreshHandler(async () => {
      setRefreshedAuthTokens({ token: 'token-new', refreshToken: 'refresh-new' });
      return true;
    });

    const response = await axiosInstance.request({ adapter, url: '/protected' });

    expect(response.data.code).toBe(200);
    expect(requestTokens).toEqual(['token-old', 'token-new']);
  });

  it('HTTP 401 刷新后通过响应拦截器重放', async () => {
    let callCount = 0;
    const adapter: AxiosAdapter = async config => {
      callCount += 1;
      if (callCount > 1) return createResponse(config, 200);

      const response = {
        ...createResponse(config, 401),
        status: 401,
        statusText: 'Unauthorized'
      };
      throw new AxiosError('Request failed with status code 401', AxiosError.ERR_BAD_REQUEST, config, null, response);
    };
    registerTokenRefreshHandler(async () => {
      setRefreshedAuthTokens({ token: 'token-new', refreshToken: 'refresh-new' });
      return true;
    });

    const response = await axiosInstance.request({ adapter, url: '/protected' });

    expect(response.data.code).toBe(200);
    expect(callCount).toBe(2);
  });

  it('未启用或刷新失败时终止会话', async () => {
    const unauthorizedHandler = vi.fn().mockResolvedValue(undefined);
    registerUnauthorizedHandler(unauthorizedHandler);
    registerTokenRefreshHandler(async () => false);

    await expect(handleUnauthorizedResponse(createConfig())).rejects.toBeInstanceOf(HttpError);

    expect(unauthorizedHandler).toHaveBeenCalledOnce();
  });

  it('续签请求自身收到 401 时不递归刷新', async () => {
    const refreshHandler = vi.fn().mockResolvedValue(true);
    const unauthorizedHandler = vi.fn().mockResolvedValue(undefined);
    registerTokenRefreshHandler(refreshHandler);
    registerUnauthorizedHandler(unauthorizedHandler);

    await expect(handleUnauthorizedResponse(createConfig({ isTokenRefresh: true }))).rejects.toBeInstanceOf(HttpError);

    expect(refreshHandler).not.toHaveBeenCalled();
    expect(unauthorizedHandler).not.toHaveBeenCalled();
  });

  it('刷新失败后清会话且不按请求提示', async () => {
    const unauthorizedHandler = vi.fn().mockResolvedValue(undefined);
    registerUnauthorizedHandler(unauthorizedHandler);

    await expect(handleUnauthorizedResponse(createConfig(), '令牌已过期')).rejects.toBeInstanceOf(HttpError);

    expect(unauthorizedHandler).toHaveBeenCalledOnce();
    expect(message.error).not.toHaveBeenCalled();
  });

  it('已经续签重发过的请求再次 401 时不再刷新', async () => {
    const refreshHandler = vi.fn().mockResolvedValue(true);
    const unauthorizedHandler = vi.fn().mockResolvedValue(undefined);
    registerTokenRefreshHandler(refreshHandler);
    registerUnauthorizedHandler(unauthorizedHandler);

    await expect(handleUnauthorizedResponse(createConfig({ isTokenRefreshRetry: true }))).rejects.toBeInstanceOf(HttpError);

    expect(refreshHandler).not.toHaveBeenCalled();
    expect(unauthorizedHandler).toHaveBeenCalledOnce();
  });
});
