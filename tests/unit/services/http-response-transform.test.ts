import { describe, expect, it } from 'vitest';
import { transformResponse } from '@/services/http/response-transform';
import type { AxiosResponse } from 'axios';

describe('response-transform', () => {
  it('json 响应保持原样', async () => {
    const response = { config: { responseType: 'json' }, data: { code: 200 }, headers: {} } as AxiosResponse;
    await transformResponse(response);
    expect(response.data).toEqual({ code: 200 });
  });

  it('blob JSON 信封可解开', async () => {
    const payload = { code: 200, data: true };
    const response = {
      config: { responseType: 'blob' },
      headers: { 'content-type': 'application/json' },
      data: JSON.stringify(payload)
    } as AxiosResponse;
    await transformResponse(response);
    expect(response.data).toEqual(payload);
  });

  it('解失败保留原始 blob', async () => {
    const blob = new Blob(['not-json'], { type: 'application/json' });
    const response = {
      config: { responseType: 'blob' },
      headers: { 'content-type': 'application/json' },
      data: blob
    } as AxiosResponse;
    await transformResponse(response);
    expect(response.data).toBe(blob);
  });
});
