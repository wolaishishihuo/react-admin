/** 函数式 api 封装：解包 Promise<T>，含拦截/401/消息/loading */
import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/components/Loading/fullScreen';
import { useUserStore } from '@/stores';
import { type BaseResponse } from '@/types';
import { clearAuth } from '@/utils/auth';
import { getAbortSignal } from './cancel';
import { HttpError, handleError, showError, showSuccess } from './error';
import { ApiStatus } from './status';
import { transformResponse } from './transform';

/** 请求配置常量 */
const REQUEST_TIMEOUT = 30000;

/** 只登出一次：并发 401 不重复触发清理（提示的去重由 showError 负责） */
let logoutInFlight: Promise<void> | null = null;

/** 扩展 AxiosRequestConfig：每请求级消息开关 + 全屏 loading */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
  loading?: boolean;
}

const { VITE_API_URL } = import.meta.env;

/** Axios 实例 */
const axiosInstance = axios.create({
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

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    // token 头为 x-access-token（对接真实后端时按契约调整）
    const token = useUserStore.getState().token;
    if (token) request.headers.set('x-access-token', token);

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json');
      request.data = JSON.stringify(request.data);
    }

    // 调用方自带 signal 就由它自己管生命周期，不纳入 cancelAllRequest
    if (!request.signal) request.signal = getAbortSignal();

    return request;
  },
  error => {
    showError(createHttpError('请求配置错误', ApiStatus.error));
    return Promise.reject(error);
  }
);

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  async (response: AxiosResponse<BaseResponse>) => {
    await transformResponse(response);

    // 非 json 响应（blob/arraybuffer 下载）不参与信封解包
    if (!isJsonResponse(response.config)) return response;

    const { code, msg } = response.data;
    if (code === ApiStatus.success) return response;
    if (code === ApiStatus.unauthorized) handleUnauthorizedError(msg);
    throw createHttpError(msg || '请求失败', code);
  },
  error => {
    if (error.response?.status === ApiStatus.unauthorized) handleUnauthorizedError();
    return Promise.reject(handleError(error));
  }
);

/** 响应体是否走业务信封（默认 json） */
function isJsonResponse(config?: AxiosRequestConfig) {
  return (config?.responseType || 'json') === 'json';
}

/** 统一创建 HttpError；缺业务码时归到通用错误 */
function createHttpError(message: string, code?: number) {
  return new HttpError(message, code ?? ApiStatus.error);
}

/** 处理 401：登出只做一次，提示按消息去重 */
function handleUnauthorizedError(message?: string): never {
  logoutInFlight ??= clearAuth().finally(() => {
    logoutInFlight = null;
  });

  const error = createHttpError(message || '未授权访问，请重新登录', ApiStatus.unauthorized);
  showError(error, true);
  throw error;
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST|PUT：params 转 body
  if (['POST', 'PUT'].includes(config.method?.toUpperCase() || '') && config.params && !config.data) {
    config.data = config.params;
    config.params = undefined;
  }

  // loading: true 全屏遮罩
  if (config.loading) showFullScreenLoading();

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config);

    // 非 json 响应交原始数据给调用方（配合 utils/download 的 blob 下载）
    if (!isJsonResponse(config)) return res.data as unknown as T;

    const body = res.data;
    if (config.showSuccessMessage && body.msg) {
      showSuccess(body.msg);
    }

    return body.data as T;
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false;
      showError(error, showMsg);
    }
    return Promise.reject(error);
  } finally {
    if (config.loading) tryHideFullScreenLoading();
  }
}

/** API 方法集合：单 config 入参，返回解包后的 Promise<T>；HTTP 层不重试，由页面按幂等性决定 */
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
