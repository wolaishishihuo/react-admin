import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { message } from '@/app/feedback';
import api from '@/services/http';
import { cancelAllRequest } from '@/services/http/cancel';
import { handleError, HttpError, type ErrorResponse } from '@/services/http/errors';

vi.mock('@/app/feedback', () => ({
  message: { error: vi.fn(), success: vi.fn() }
}));

function createSuccessResponse(config: InternalAxiosRequestConfig): AxiosResponse {
  return {
    config,
    data: { code: 200, data: true, msg: '成功' },
    headers: new AxiosHeaders({ 'content-type': 'application/json' }),
    status: 200,
    statusText: 'OK'
  };
}

function startHangingRequest() {
  let markStarted!: () => void;
  const started = new Promise<void>(resolve => {
    markStarted = resolve;
  });
  const adapter: AxiosAdapter = config => {
    markStarted();
    return new Promise((_, reject) => {
      const abort = () => {
        reject(new AxiosError('canceled', AxiosError.ERR_CANCELED, config));
      };
      const { signal } = config;
      if (signal?.aborted) {
        abort();
        return;
      }
      signal?.addEventListener?.('abort', abort);
    });
  };

  return { pending: api.get({ url: '/slow', adapter }), started };
}

function isCanceled(error: unknown) {
  return error instanceof AxiosError && error.code === AxiosError.ERR_CANCELED;
}

describe('请求取消', () => {
  beforeEach(() => {
    vi.mocked(message.error).mockClear();
  });

  afterEach(() => {
    cancelAllRequest();
  });

  it('ERR_CANCELED 保持 axios 取消错误，不转成 HttpError', () => {
    const error = new AxiosError<ErrorResponse>('canceled', AxiosError.ERR_CANCELED);

    expect(() => handleError(error)).toThrow(AxiosError);
    try {
      handleError(error);
    } catch (thrown) {
      expect(thrown).not.toBeInstanceOf(HttpError);
      expect(isCanceled(thrown)).toBe(true);
    }
  });

  it('cancelAllRequest 取消在途请求且不 toast', async () => {
    const { pending, started } = startHangingRequest();
    await started;
    cancelAllRequest();

    await expect(pending).rejects.toSatisfy(isCanceled);
    expect(message.error).not.toHaveBeenCalled();
  });

  it('cancelAllRequest 之后新发起的请求仍可完成', async () => {
    const { pending, started } = startHangingRequest();
    await started;
    cancelAllRequest();
    await pending.catch(() => undefined);

    const adapter: AxiosAdapter = async config => createSuccessResponse(config);
    await expect(api.get({ url: '/ok', adapter })).resolves.toBe(true);
  });
});
