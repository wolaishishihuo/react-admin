/** 列表演示接口类型 */
import { type ReqPage } from '../common';

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
