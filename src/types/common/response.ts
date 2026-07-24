/** 基础 API 响应壳 */

export interface BaseResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}
