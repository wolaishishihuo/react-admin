/** 所有未自带 signal 的请求共享该控制器，供登出或会话失效时统一取消。 */
let abortController = new AbortController();

export const getAbortSignal = () => abortController.signal;

export function cancelAllRequest() {
  abortController.abort();
  // 已 abort 的 signal 不能复用，否则后续请求会在发出时立即失败。
  abortController = new AbortController();
}

export const cancelAllRequests = cancelAllRequest;
