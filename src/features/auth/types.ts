export interface ReqLogin {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface AuthTokens {
  refreshToken?: string;
  token: string;
}

export type ResLogin = AuthTokens;

export interface RefreshTokenResponse {
  refreshToken: string;
  token: string;
}
