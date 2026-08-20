/** HTTP 与认证模块的解耦边界，并将并发 401 合并为一次会话失效处理。 */
let unauthorizedHandler: (() => Promise<void>) | null = null;
let unauthorizedInFlight: Promise<void> | null = null;

export function registerUnauthorizedHandler(handler: () => Promise<void>) {
  unauthorizedHandler = handler;
}

export function expireSession() {
  if (!unauthorizedHandler) return Promise.resolve();
  // 多个请求同时返回 401 时复用同一次失效处理，避免重复清理和跳转。
  unauthorizedInFlight ??= unauthorizedHandler().finally(() => {
    unauthorizedInFlight = null;
  });
  return unauthorizedInFlight;
}
