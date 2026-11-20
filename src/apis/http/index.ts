import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { ResultData } from '@/apis/interface';
import { LOGIN_URLS } from '@/apis/modules/login/urls';
import { queryClient } from '@/apis/query';
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/components/Loading/fullScreen';
import { enableRefreshToken, LOGIN_URL } from '@/config';
import { ResultEnum } from '@/constants';
import { message } from '@/hooks/useMessage';
import { useAuthStore, useTabsStore, useUserStore } from '@/stores';

import { checkStatus } from './helper/checkStatus';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 续签后的重放标记：带此标记的 401 不再二次刷新 */
    __isRetryRequest?: boolean;
    /** 是否展示全屏 loading */
    loading?: boolean;
    /** 是否静默错误提示（适合后台刷新、登出等场景） */
    silent?: boolean;
    /** 401 时是否跳过自动续签与强制登出（如登出或登录接口自身） */
    skipAuthRefresh?: boolean;
  }
}

interface RefreshQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

const config = {
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: ResultEnum.TIMEOUT as number,
  withCredentials: false
};

function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}

function mergeAbortSignals(primary: AbortSignal, external?: AxiosRequestConfig['signal']): AxiosRequestConfig['signal'] {
  if (!external || external === primary) return primary;
  if (typeof AbortSignal.any === 'function' && external instanceof AbortSignal) {
    return AbortSignal.any([primary, external]);
  }

  const controller = new AbortController();
  const abort = () => controller.abort();

  if (primary.aborted || external.aborted) {
    controller.abort();
    return controller.signal;
  }

  primary.addEventListener('abort', abort, { once: true });
  if (external instanceof AbortSignal) {
    external.addEventListener('abort', abort, { once: true });
  }
  return controller.signal;
}

class RequestHttp {
  service: AxiosInstance;
  /** 刷新接口单独实例，避免 401 再次走进续签 */
  refreshService: AxiosInstance;
  public isRefreshing = false;
  public refreshTokenQueue: RefreshQueueItem[] = [];
  private abortController = new AbortController();

  public constructor(axiosConfig: AxiosRequestConfig) {
    this.service = axios.create(axiosConfig);
    this.refreshService = axios.create(axiosConfig);

    this.service.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig) => {
        if (requestConfig.loading) showFullScreenLoading();
        requestConfig.signal = mergeAbortSignals(this.abortController.signal, requestConfig.signal);
        if (requestConfig.headers && typeof requestConfig.headers.set === 'function') {
          requestConfig.headers.set('Authorization', formatToken(useUserStore.getState().token));
        }
        return requestConfig;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { config: reqConfig, data } = response;
        if (reqConfig.loading) tryHideFullScreenLoading();
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          if (!reqConfig.silent) message.error(data.msg);
          return Promise.reject(data);
        }
        return data;
      },
      async (error: AxiosError) => {
        const { config: reqConfig, response } = error;
        if (reqConfig?.loading) tryHideFullScreenLoading();

        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        if (response?.status === 401 && !reqConfig?.skipAuthRefresh) {
          return this.handleHttpUnauthorized(error, reqConfig);
        }

        if (!reqConfig?.silent) {
          if (error.message.includes('timeout')) message.error('请求超时！请您稍后重试');
          if (error.message.includes('Network Error')) message.error('网络错误！请您稍后重试');
          if (response) checkStatus(response.status);
        }
        if (!window.navigator.onLine) window.$navigate?.('/500');
        return Promise.reject(error);
      }
    );
  }

  /** 中止所有在途请求并重建控制器，供登出或强制重置会话调用 */
  cancelAllRequests() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  private async doRefreshToken(signal?: AbortSignal) {
    const refreshToken = useUserStore.getState().refreshToken;
    if (!refreshToken) {
      throw new Error('Missing refresh token');
    }
    const resp = await this.refreshService.post(LOGIN_URLS.REFRESH, { refreshToken }, { signal });
    const payload = resp.data?.data ?? {};
    const newToken = payload.accessToken || payload.access_token;
    if (!newToken) {
      throw new Error('Refresh token failed');
    }
    useUserStore.getState().setToken(newToken);
    if (payload.refreshToken) {
      useUserStore.getState().setRefreshToken(payload.refreshToken);
    }
    return newToken as string;
  }

  /**
   * HTTP 401：刷新 access token，并发请求排队后重放。
   * `__isRetryRequest` 只约束「这一次续签后的重放」，防止刷新死循环。
   */
  private async handleHttpUnauthorized(error: AxiosError, reqConfig?: AxiosRequestConfig) {
    if (!reqConfig || !enableRefreshToken || reqConfig.__isRetryRequest || !useUserStore.getState().refreshToken) {
      clearAuthSession();
      throw error;
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshTokenQueue.push({
          resolve: (newToken: string) => {
            if (reqConfig.headers) {
              reqConfig.headers.Authorization = formatToken(newToken);
            }
            reqConfig.__isRetryRequest = true;
            resolve(this.service.request(reqConfig));
          },
          reject
        });
      });
    }

    this.isRefreshing = true;
    reqConfig.__isRetryRequest = true;
    const refreshSignal = this.abortController.signal;

    try {
      const newToken = await this.doRefreshToken(refreshSignal);
      const queue = this.refreshTokenQueue;
      this.refreshTokenQueue = [];
      queue.forEach(item => item.resolve(newToken));
      if (reqConfig.headers) {
        reqConfig.headers.Authorization = formatToken(newToken);
      }
      return this.service.request(reqConfig);
    } catch (refreshError) {
      const queue = this.refreshTokenQueue;
      this.refreshTokenQueue = [];
      queue.forEach(item => item.reject(refreshError));
      if (!axios.isCancel(refreshError)) {
        clearAuthSession();
      }
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  get<T>(url: string, params?: object, axiosConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ...axiosConfig });
  }
  post<T>(url: string, params?: object | string, axiosConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, axiosConfig);
  }
  put<T>(url: string, params?: object, axiosConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, axiosConfig);
  }
  delete<T>(url: string, params?: object, axiosConfig: AxiosRequestConfig = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ...axiosConfig });
  }
  download(url: string, params?: object, axiosConfig: AxiosRequestConfig = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ...axiosConfig, responseType: 'blob' });
  }
}

const http = new RequestHttp(config);

/** 中止所有在途 HTTP 请求与进行中的 Query（不清理缓存，避免已挂载页面重发） */
export function cancelActiveRequests() {
  http.cancelAllRequests();
  void queryClient.cancelQueries();
}

/**
 * 清理本地会话状态并跳转登录页（主动登出与 401 强制登出共用）。
 * Query 缓存在受保护路由随 token 清空完成卸载后，由 RouterProvider 统一 clear，
 * 避免在页面卸载前清空缓存触发活跃 useQuery 立即重发导致 401。
 */
export function clearAuthSession() {
  const userState = useUserStore.getState();
  const authState = useAuthStore.getState();
  const hasSession = Boolean(
    userState.token || userState.refreshToken || authState.authMenuList.length || authState.authButtons.length
  );

  if (!hasSession) return;

  cancelActiveRequests();

  userState.setToken('');
  userState.setRefreshToken('');
  userState.setUserInfo({ name: '' });
  authState.setAuthMenuList([]);
  authState.setAuthButtons([]);
  useTabsStore.getState().setTabsList([]);

  window.$navigate?.(LOGIN_URL, { replace: true });
}

export default http;
