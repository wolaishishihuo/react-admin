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

export interface UserItem {
  id: string;
  username: string;
  gender: number;
  mobile: string;
  icon: string;
  status: number;
  createTime: string;
}

export interface ReqUserList extends ReqPage {
  username?: string;
  gender?: number;
  status?: number;
}
