/**
 * Axios 底层客户端：注入 token/取消信号，处理 HTTP 状态、业务信封、二进制响应和 401。
 * 业务调用统一经过 request.ts，不直接消费该实例。
 */
import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { getToken } from '@/stores/modules/session.store';
import type { BaseResponse } from './types';
import { expireSession, refreshToken } from './unauthorized';
import { getAbortSignal } from './cancel';
import { HttpError, handleError, showError } from './errors';
import { ApiStatus } from './status';
import { transformResponse } from './response-transform';

const REQUEST_TIMEOUT = 30000;

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
}

const { VITE_API_URL } = import.meta.env;

export const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: false,
  validateStatus: status => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type'];
      if (typeof contentType === 'string' && contentType.includes('application/json')) {
        try {
          return JSON.parse(data);
        } catch {
          return data;
        }
      }
      return data;
    }
  ]
});

axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) request.headers.set('x-access-token', token);

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json');
      request.data = JSON.stringify(request.data);
    }

    if (!request.signal) request.signal = getAbortSignal();
    return request;
  },
  error => {
    showError(createHttpError('请求配置错误', ApiStatus.error));
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  async (response: AxiosResponse<BaseResponse>) => {
    // 二进制下载可能返回 JSON 错误体；先尽力转换，再决定是否参与普通信封解包。
    await transformResponse(response);
    if (!isJsonResponse(response.config)) return response;

    const { code, msg } = response.data;
    if (code === ApiStatus.success) return response;
    if (code === ApiStatus.unauthorized) return handleUnauthorizedResponse(response.config, msg);
    throw createHttpError(msg || '请求失败', code);
  },
  async error => {
    if (error.response?.status === ApiStatus.unauthorized && error.config) {
      return handleUnauthorizedResponse(error.config, error.response.data?.msg);
    }
    return Promise.reject(handleError(error));
  }
);

export function isJsonResponse(config?: AxiosRequestConfig) {
  return (config?.responseType || 'json') === 'json';
}

export function createHttpError(message: string, code?: number) {
  return new HttpError(message, code ?? ApiStatus.error);
}

export async function handleUnauthorizedResponse(
  config: InternalAxiosRequestConfig,
  message?: string
): Promise<AxiosResponse<BaseResponse>> {
  if (config.isTokenRefresh) throw createHttpError(message || '令牌刷新失败', ApiStatus.unauthorized);

  if (!config.isTokenRefreshRetry && (await refreshToken())) {
    config.isTokenRefreshRetry = true;
    const token = getToken();
    if (token) config.headers.set('x-access-token', token);
    return axiosInstance.request<BaseResponse>(config);
  }

  await expireSession();
  // 过期码不按请求提示：刷新失败已统一清认证并跳登录，避免并发 401 重复 toast。
  throw createHttpError(message || '未授权访问，请重新登录', ApiStatus.unauthorized);
}
