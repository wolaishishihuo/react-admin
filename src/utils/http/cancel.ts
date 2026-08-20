/**
 * 在途请求的共用 AbortController
 *
 * 独立成文件：utils/auth 要用 cancelAllRequest，而 http/index 的 401 要用 clearAuth，
 * 本文件不 import 任何业务模块，环就断在这里。
 */

// 不按 requestId 存 Map：请求正常结束时没有地方删除条目，长驻页面下那张表只增不减
let abortController = new AbortController();

export const getAbortSignal = () => abortController.signal;

/** 取消全部在途请求（调用方自带 signal 的除外） */
export function cancelAllRequest() {
  abortController.abort();
  // 必须换新的：已 abort 的 signal 挂到后续请求上，会让它们一发出就立刻失败
  abortController = new AbortController();
}
