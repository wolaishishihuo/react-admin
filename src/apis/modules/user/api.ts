import http from '@/apis/http';
import { ReqPage, ResCurrentUser, ResPage, UserList } from '@/apis/interface';
import currentUser from '@/assets/json/currentUser.json';

import { USER_URLS } from './urls';

export async function fetchGetUserList(params: ReqPage) {
  const { data } = await http.post<ResPage<UserList>>(USER_URLS.LIST, params);
  return data;
}

/** 当前用户（含 buttons）。模板期读本地 JSON，接真实后端后改为 http.get(USER_URLS.ME) */
export async function fetchGetCurrentUser() {
  return currentUser.data as ResCurrentUser;
}
