/** HTTP 错误：HttpError、Axios 转换、统一中文提示、断网跳 /500 */
import { type AxiosError } from 'axios';
import { message } from '@/hooks/useMessage';
import { ApiStatus } from './status';

// 错误响应
export interface ErrorResponse {
  code: number;
  msg: string;
  data?: unknown;
}

// 错误日志
export interface ErrorLogData {
  code: number;
  message: string;
  data?: unknown;
  timestamp: string;
  url?: string;
  method?: string;
  stack?: string;
}

/** 结构化 HTTP 错误 */
export class HttpError extends Error {
  public readonly code: number;
  public readonly data?: unknown;
  public readonly timestamp: string;
  public readonly url?: string;
  public readonly method?: string;

  constructor(
    message: string,
    code: number,
    options?: {
      data?: unknown;
      url?: string;
      method?: string;
    }
  ) {
    super(message);
    this.name = 'HttpError';
    this.code = code;
    this.data = options?.data;
    this.timestamp = new Date().toISOString();
    this.url = options?.url;
    this.method = options?.method;
  }

  public toLogData(): ErrorLogData {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      url: this.url,
      method: this.method,
      stack: this.stack
    };
  }
}

/** 按状态码返回统一中文错误提示 */
const getErrorMessage = (status: number): string => {
  const errorMap: Record<number, string> = {
    [ApiStatus.unauthorized]: '未授权访问，请重新登录',
    [ApiStatus.forbidden]: '禁止访问该资源',
    [ApiStatus.notFound]: '请求的资源不存在',
    [ApiStatus.methodNotAllowed]: '请求方法不允许',
    [ApiStatus.requestTimeout]: '请求超时，请稍后重试',
    [ApiStatus.internalServerError]: '服务器内部错误，请稍后重试',
    [ApiStatus.badGateway]: '网关错误，请稍后重试',
    [ApiStatus.serviceUnavailable]: '服务暂时不可用，请稍后重试',
    [ApiStatus.gatewayTimeout]: '网关超时，请稍后重试'
  };

  return errorMap[status] || '服务器内部错误，请稍后重试';
};

/** 将 AxiosError 转为 HttpError 抛出 */
export function handleError(error: AxiosError<ErrorResponse>): never {
  if (error.code === 'ERR_CANCELED') {
    console.warn('Request cancelled:', error.message);
    throw new HttpError('请求已取消', ApiStatus.error);
  }

  const statusCode = error.response?.status;
  const errorMessage = error.response?.data?.msg || error.message;
  const requestConfig = error.config;

  // 断网跳 /500
  if (!error.response) {
    if (!window.navigator.onLine) window.$navigate('/500');
    throw new HttpError('网络连接异常，请检查网络连接', ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    });
  }

  const errorMsg = statusCode ? getErrorMessage(statusCode) : errorMessage || '请求失败';
  throw new HttpError(errorMsg, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase()
  });
}

/** 显示错误消息并记录日志 */
export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage) {
    message.error(error.message);
  }
  console.error('[HTTP Error]', error.toLogData());
}

/** 显示成功消息 */
export function showSuccess(msg: string, showMessage: boolean = true): void {
  if (showMessage) {
    message.success(msg);
  }
}

/** 判断是否为 HttpError */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError;
};
