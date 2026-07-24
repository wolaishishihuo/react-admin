/** 认证接口类型 */

export interface ReqLogin {
  username: string;
  password: string;
}

export interface LoginUserInfo {
  name: string;
  avatar?: string;
}

export interface ResLogin {
  token: string;
  userInfo: LoginUserInfo;
}
