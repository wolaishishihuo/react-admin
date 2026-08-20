/** HTTP 与认证模块的解耦边界，并合并并发的刷新与会话失效处理。 */
const REFRESH_REUSE_WINDOW = 1000;

let unauthorizedHandler: (() => Promise<void>) | null = null;
let unauthorizedInFlight: Promise<void> | null = null;
let tokenRefreshHandler: (() => Promise<boolean>) | null = null;
let tokenRefreshInFlight: Promise<boolean> | null = null;
let tokenRefreshReuseTimer: ReturnType<typeof setTimeout> | null = null;

export function registerUnauthorizedHandler(handler: () => Promise<void>) {
  unauthorizedHandler = handler;
}

export function registerTokenRefreshHandler(handler: (() => Promise<boolean>) | null) {
  tokenRefreshHandler = handler;
}

export async function refreshToken() {
  if (!tokenRefreshHandler) return false;

  tokenRefreshInFlight ??= tokenRefreshHandler().catch(() => false);
  const success = await tokenRefreshInFlight;

  tokenRefreshReuseTimer ??= setTimeout(() => {
    tokenRefreshInFlight = null;
    tokenRefreshReuseTimer = null;
  }, REFRESH_REUSE_WINDOW);

  return success;
}

export function resetTokenRefresh() {
  if (tokenRefreshReuseTimer) clearTimeout(tokenRefreshReuseTimer);
  tokenRefreshInFlight = null;
  tokenRefreshReuseTimer = null;
}

export function expireSession() {
  if (!unauthorizedHandler) return Promise.resolve();
  // 多个请求同时返回 401 时复用同一次失效处理，避免重复清理和跳转。
  unauthorizedInFlight ??= unauthorizedHandler().finally(() => {
    unauthorizedInFlight = null;
  });
  return unauthorizedInFlight;
}
