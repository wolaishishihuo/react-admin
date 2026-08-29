import http from "@/apis/http";
import { ReqPage, ResPage, UserList } from "@/apis/interface";

import { USER_URLS } from "./urls";

export async function fetchGetUserList(params: ReqPage) {
  const { data } = await http.post<ResPage<UserList>>(USER_URLS.LIST, params);
  return data;
}
