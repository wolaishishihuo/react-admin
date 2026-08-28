import http from "@/apis";
import { PORT1 } from "@/apis/config/servicePort";
import { ReqPage, ResPage, UserList } from "@/apis/interface/index";

/**
 * @name UserModule
 */
// Get user list
export const getUserList = (params: ReqPage) => {
  return http.post<ResPage<UserList>>(PORT1 + `/user/list`, params);
};
