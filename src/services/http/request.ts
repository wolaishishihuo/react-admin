import type { BaseResponse } from './types';
import { axiosInstance, isJsonResponse, type ExtendedAxiosRequestConfig } from './client';
import { HttpError, showError, showSuccess } from './errors';
import { ApiStatus } from './status';

async function request<T>(config: ExtendedAxiosRequestConfig): Promise<T> {
  if (['POST', 'PUT'].includes(config.method?.toUpperCase() || '') && config.params && !config.data) {
    config.data = config.params;
    config.params = undefined;
  }

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config);
    if (!isJsonResponse(config)) return res.data as unknown as T;

    const body = res.data;
    if (config.showSuccessMessage && body.msg) showSuccess(body.msg);
    return body.data as T;
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      showError(error, config.showErrorMessage !== false);
    }
    return Promise.reject(error);
  }
}

const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'GET' });
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'POST' });
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'PUT' });
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return request<T>({ ...config, method: 'DELETE' });
  },
  request
};

export default api;
