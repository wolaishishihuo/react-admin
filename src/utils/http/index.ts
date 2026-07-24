/** 函数式 api 封装：解包 Promise<T>，含拦截/401/消息/loading */
import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/components/Loading/fullScreen';
import { LOGIN_URL } from '@/config';
import { setToken, setAuthMenuList, useUserStore } from '@/stores';
import { type BaseResponse } from '@/types';
import { HttpError, handleError, showError, showSuccess } from './error';
import { ApiStatus } from './status';

/** 请求配置常量 */
const REQUEST_TIMEOUT = 30000;
const LOGOUT_DELAY = 500;
const MAX_RETRIES = 0;
const RETRY_DELAY = 1000;
const UNAUTHORIZED_DEBOUNCE_TIME = 3000;

/** 401 防抖状态 */
let isUnauthorizedErrorShown = false;
let unauthorizedTimer: ReturnType<typeof setTimeout> | null = null;

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

    return request;
  },
  error => {
    showError(createHttpError('请求配置错误', ApiStatus.error));
    return Promise.reject(error);
  }
);

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
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

/** 统一创建 HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code);
}

/** 处理 401 错误（带防抖） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || '未授权访问，请重新登录', ApiStatus.unauthorized);

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true;
    logOut();

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME);

    showError(error, true);
    throw error;
  }

  throw error;
}

/** 重置 401 防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false;
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer);
  unauthorizedTimer = null;
}

/** 退出登录：清 token + 清菜单 + 跳登录页 */
function logOut() {
  setTimeout(() => {
    setToken('');
    setAuthMenuList([]);
    window.$navigate(LOGIN_URL);
  }, LOGOUT_DELAY);
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode);
}

/** 请求重试逻辑 */
async function retryRequest<T>(config: ExtendedAxiosRequestConfig, retries: number = MAX_RETRIES): Promise<T> {
  try {
    return await request<T>(config);
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY);
      return retryRequest<T>(config, retries - 1);
    }
    throw error;
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

/** API 方法集合：单 config 入参，返回解包后的 Promise<T> */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' });
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' });
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' });
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' });
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config);
  }
};

export default api;
