import axios from 'axios';

/**
 * 仅重试瞬时网络错误或 5xx / 408 / 429；
 * 已取消请求、业务码错误（非 AxiosError）及 4xx（含 401/403/404）一律不重试。
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (axios.isCancel(error)) return false;
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return false;
  }

  return true;
}

/** Default Query config */
export const DEFAULT_QUERY_CONFIG = {
  gcTime: 10 * 60 * 1000,
  networkMode: 'online' as const,
  refetchOnMount: true,
  refetchOnReconnect: true,
  refetchOnWindowFocus: false,
  retry: shouldRetryQuery,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  retryOnMount: true,
  staleTime: 30 * 1000,
  throwOnError: false
};

/** Default Mutation config */
export const DEFAULT_MUTATION_CONFIG = {
  gcTime: 60 * 1000,
  networkMode: 'online' as const,
  retry: false,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  throwOnError: false
};
