import api from '@/services/http';
import type { AuthUser, RefreshTokenResponse, ReqLogin, ResLogin } from './types';

export function loginApi(params: ReqLogin) {
  return api.post<ResLogin>({ url: '/login', data: params });
}

export function refreshTokenApi(refreshToken: string) {
  return api.post<RefreshTokenResponse>({
    url: '/refreshToken',
    data: { refreshToken },
    isTokenRefresh: true,
    showErrorMessage: false
  });
}

export function getUserInfoApi() {
  if (localStorage.getItem('mockUserInfoFail') === '1') {
    return Promise.reject(new Error('模拟用户信息请求失败'));
  }
  if (localStorage.getItem('mockSessionExpired') === '1') {
    return Promise.resolve(null);
  }
  return api.get<AuthUser | null>({ url: '/user/info' });
}

export function logoutApi() {
  return api.post({ url: '/logout', showErrorMessage: false });
}
