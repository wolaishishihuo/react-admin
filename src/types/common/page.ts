/** 分页基础类型：请求 { page, limit }，响应 { list, total } */

export interface ReqPage {
  page?: number;
  limit?: number;
}

export interface ResPage<T> {
  list: T[];
  page?: number;
  limit?: number;
  total: number;
}
