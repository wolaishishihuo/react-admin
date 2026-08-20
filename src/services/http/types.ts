declare module 'axios' {
  interface AxiosRequestConfig {
    /** 续签请求本身，收到 401 时不得再次续签 */
    isTokenRefresh?: boolean;
    /** 内部字段：当前请求已经续签重发过一次 */
    isTokenRefreshRetry?: boolean;
  }
}

export interface BaseResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface HttpRequestConfig {
  url?: string;
  method?: string;
  params?: unknown;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text';
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
}
