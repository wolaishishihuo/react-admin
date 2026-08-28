import http from "@/apis";
import { PORT1 } from "@/apis/config/servicePort";
import { ReqLogin, ResLogin } from "@/apis/interface/index";
import authButtonList from "@/assets/json/authButtonList.json";
import authMenuList from "@/assets/json/authMenuList.json";
import { AuthState } from "@/stores/interface";

/**
 * @name AuthModule
 */
// User login
export const loginApi = (params: ReqLogin) => {
  return http.post<ResLogin>(PORT1 + `/login`, params);
  // return http.post<ResLogin>(PORT1 + `/login`, params, { loading: false });
  // return http.post<ResLogin>(PORT1 + `/login`, {}, { params });
  // return http.post<ResLogin>(PORT1 + `/login`, qs.stringify(params));
  // return http.get<ResLogin>(PORT1 + `/login?${qs.stringify(params, { arrayFormat: "repeat" })}`);
};

// Get menu list
export const getAuthMenuListApi = () => {
  return http.get<AuthState["authMenuList"]>(PORT1 + `/menu/list`);
  return authMenuList;
};

// Get button permissions
export const getAuthButtonListApi = () => {
  return http.get<AuthState["authButtonList"]>(PORT1 + `/auth/buttons`);
  return authButtonList;
};

// User logout
export const logoutApi = () => {
  return http.post(PORT1 + `/logout`, {}, { loading: true });
};
