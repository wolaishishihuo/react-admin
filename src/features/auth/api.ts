import api from '@/services/http';
import type { AuthUser, ReqLogin, ResLogin } from './types';

export function loginApi(params: ReqLogin) {
  return api.post<ResLogin>({ url: '/login', data: params });
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
