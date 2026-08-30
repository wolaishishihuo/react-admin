import { PORT1 } from "@/apis/http/config/servicePort";

export const LOGIN_URLS = {
  AUTH_BUTTONS: `${PORT1}/auth/buttons`,
  LOGIN: `${PORT1}/login`,
  LOGOUT: `${PORT1}/logout`,
  REFRESH: `${PORT1}/auth/refresh-token`
} as const;
