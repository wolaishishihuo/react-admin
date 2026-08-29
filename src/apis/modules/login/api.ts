import http from "@/apis/http";
import { ReqLogin, ResLogin } from "@/apis/interface";
import authMenuList from "@/assets/json/authMenuList.json";
import { AuthState } from "@/stores/interface";

import { LOGIN_URLS } from "./urls";

export async function fetchLogin(params: ReqLogin) {
  const { data } = await http.post<ResLogin>(LOGIN_URLS.LOGIN, params);
  return data;
}

export async function fetchGetAuthMenuList() {
  return authMenuList.data as AuthState["authMenuList"];
}

export async function fetchGetAuthButtonList() {
  const { data } = await http.get<AuthState["authButtonList"]>(LOGIN_URLS.AUTH_BUTTONS);
  return data;
}

export async function fetchLogout() {
  await http.post(LOGIN_URLS.LOGOUT, {}, { loading: true });
}
