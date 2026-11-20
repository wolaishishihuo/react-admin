import { ResCurrentUser } from '@/apis/interface';
import currentUser from '@/assets/json/currentUser.json';

/** 当前用户（含 buttons）。模板期读本地 JSON，接真实后端后改为 http.get(USER_URLS.ME) */
export async function fetchGetCurrentUser() {
  return currentUser.data as ResCurrentUser;
}
