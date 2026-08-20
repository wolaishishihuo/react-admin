/** QueryClient 单例：组件外（logout 等）也要能清服务端状态缓存 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
    mutations: {
      retry: false
    }
  }
});
