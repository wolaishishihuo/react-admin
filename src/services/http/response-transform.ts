/**
 * 二进制响应解 JSON 信封
 *
 * 移植自 skyroc `packages/@core/axios/src/shared.ts`
 * MIT License, Copyright (c) 2026 Ohh
 */
import type { AxiosResponse } from 'axios';

export async function transformResponse(response: AxiosResponse) {
  const { responseType } = response.config;
  if (!responseType || responseType === 'json') return;

  const contentType = response.headers['content-type'];
  if (typeof contentType !== 'string' || !contentType.includes('application/json')) return;

  if (responseType === 'blob') await transformBlobToJson(response);
  if (responseType === 'arraybuffer') await transformArrayBufferToJson(response);
}

async function transformBlobToJson(response: AxiosResponse) {
  try {
    let data = response.data;
    if (typeof data === 'string') data = JSON.parse(data);

    if (Object.prototype.toString.call(data) === '[object Blob]' || data instanceof Blob) {
      data = JSON.parse(await (data as Blob).text());
    }

    response.data = data;
  } catch {
    // 解不出 JSON 说明响应体确实是二进制，保留原始 data 交给调用方
  }
}

async function transformArrayBufferToJson(response: AxiosResponse) {
  try {
    let data = response.data;
    if (typeof data === 'string') data = JSON.parse(data);

    if (Object.prototype.toString.call(data) === '[object ArrayBuffer]') {
      data = JSON.parse(new TextDecoder().decode(data as ArrayBuffer));
    }

    response.data = data;
  } catch {
    // 转换尽力而为，失败不能把二进制弄丢
  }
}
