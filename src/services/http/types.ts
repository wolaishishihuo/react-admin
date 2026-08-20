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
