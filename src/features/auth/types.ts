export interface ReqLogin {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ResLogin {
  token: string;
}
