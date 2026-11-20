import axios, { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { DEFAULT_MUTATION_CONFIG, shouldRetryQuery } from '@/apis/query';

function createHttpError(status?: number) {
  const config = { headers: new AxiosHeaders() };
  const response = status
    ? {
        config,
        data: {},
        headers: {},
        status,
        statusText: String(status)
      }
    : undefined;

  return new AxiosError(`HTTP ${status ?? 'network'}`, 'ERR_BAD_REQUEST', config, undefined, response);
}

describe('Query defaults & shouldRetryQuery', () => {
  it('disables mutation retries by default', () => {
    expect(DEFAULT_MUTATION_CONFIG.retry).toBe(false);
  });

  it('never retries canceled requests or business errors', () => {
    expect(shouldRetryQuery(0, new axios.CanceledError('canceled'))).toBe(false);
    expect(shouldRetryQuery(0, { code: '500', msg: '手机号已存在' })).toBe(false);
    expect(shouldRetryQuery(0, new Error('generic error'))).toBe(false);
  });

  it('never retries 4xx client/auth errors except 408 and 429', () => {
    expect(shouldRetryQuery(0, createHttpError(400))).toBe(false);
    expect(shouldRetryQuery(0, createHttpError(401))).toBe(false);
    expect(shouldRetryQuery(0, createHttpError(403))).toBe(false);
    expect(shouldRetryQuery(0, createHttpError(404))).toBe(false);
    expect(shouldRetryQuery(0, createHttpError(422))).toBe(false);

    expect(shouldRetryQuery(0, createHttpError(408))).toBe(true);
    expect(shouldRetryQuery(0, createHttpError(429))).toBe(true);
  });

  it('retries network errors and 5xx up to 2 times', () => {
    expect(shouldRetryQuery(0, createHttpError())).toBe(true);
    expect(shouldRetryQuery(1, createHttpError(500))).toBe(true);
    expect(shouldRetryQuery(1, createHttpError(503))).toBe(true);
    expect(shouldRetryQuery(2, createHttpError(500))).toBe(false);
    expect(shouldRetryQuery(2, createHttpError())).toBe(false);
  });
});
