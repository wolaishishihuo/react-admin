import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { ResultData } from '@/apis/interface';
import { LOGIN_URLS } from '@/apis/modules/login/urls';
import { queryClient } from '@/apis/query';
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/components/Loading/fullScreen';
import { enableRefreshToken, LOGIN_URL } from '@/config';
import { ResultEnum } from '@/constants';
import { message } from '@/hooks/useMessage';
import { useUserStore } from '@/stores';

import { checkStatus } from './helper/checkStatus';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** 续签后的重放标记：带此标记的 401 不再二次刷新 */
    __isRetryRequest?: boolean;
  }
}

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  loading?: boolean;
}

const config = {
  baseURL: import.meta.env.VITE_API_URL as string,
  timeout: ResultEnum.TIMEOUT as number,
  withCredentials: false
};

/** 刷新接口单独实例，避免 401 再次走进续签 */
const baseRequestClient = axios.create(config);

function formatToken(token: null | string) {
  return token ? `Bearer ${token}` : null;
}

async function doReAuthenticate() {
  queryClient.clear();
  useUserStore.getState().setToken('');
  useUserStore.getState().setRefreshToken('');
  window.$navigate(LOGIN_URL);
}

async function doRefreshToken() {
  const refreshToken = useUserStore.getState().refreshToken;
  const resp = await baseRequestClient.post(LOGIN_URLS.REFRESH, { refreshToken });
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

class RequestHttp {
  service: AxiosInstance;
  public isRefreshing = false;
  public refreshTokenQueue: ((token: string) => void)[] = [];

  public constructor(axiosConfig: AxiosRequestConfig) {
    this.service = axios.create(axiosConfig);

    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        config.loading && showFullScreenLoading();
        if (config.headers && typeof config.headers.set === 'function') {
          config.headers.set('Authorization', formatToken(useUserStore.getState().token));
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;
        tryHideFullScreenLoading();
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          message.error(data.msg);
          return Promise.reject(data);
        }
        return data;
      },
      async (error: AxiosError) => {
        tryHideFullScreenLoading();

        const { config, response } = error;
        if (response?.status === 401) {
          return this.handleHttpUnauthorized(error, config);
        }

        if (error.message.indexOf('timeout') !== -1) message.error('请求超时！请您稍后重试');
        if (error.message.indexOf('Network Error') !== -1) message.error('网络错误！请您稍后重试');
        if (response) checkStatus(response.status);
        if (!window.navigator.onLine) window.$navigate('/500');
        return Promise.reject(error);
      }
    );
  }

  /**
   * HTTP 401：刷新 access token，并发请求排队后重放。
   * `__isRetryRequest` 只约束「这一次续签后的重放」，防止刷新死循环。
   */
  private async handleHttpUnauthorized(error: AxiosError, config?: AxiosRequestConfig) {
    if (!config) {
      await doReAuthenticate();
      throw error;
    }

    if (!enableRefreshToken || config.__isRetryRequest) {
      await doReAuthenticate();
      throw error;
    }

    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.refreshTokenQueue.push((newToken: string) => {
          if (config.headers) {
            config.headers.Authorization = formatToken(newToken);
          }
          resolve(this.service.request(config));
        });
      });
    }

    this.isRefreshing = true;
    config.__isRetryRequest = true;

    try {
      const newToken = await doRefreshToken();
      this.refreshTokenQueue.forEach(callback => callback(newToken));
      this.refreshTokenQueue = [];
      return this.service.request(config);
    } catch (refreshError) {
      this.refreshTokenQueue.forEach(callback => callback(''));
      this.refreshTokenQueue = [];
      await doReAuthenticate();
      throw refreshError;
    } finally {
      this.isRefreshing = false;
    }
  }

  get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.get(url, { params, ..._object });
  }
  post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
    return this.service.post(url, params, _object);
  }
  put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
    return this.service.put(url, params, _object);
  }
  delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
    return this.service.delete(url, { params, ..._object });
  }
  download(url: string, params?: object, _object = {}): Promise<BlobPart> {
    return this.service.post(url, params, { ..._object, responseType: 'blob' });
  }
}

export default new RequestHttp(config);
