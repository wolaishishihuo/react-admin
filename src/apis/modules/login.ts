import http from '@/apis';
import { ReqLogin, ResLogin } from '@/apis/interface/index';
import authButtonList from '@/assets/json/authButtonList.json';
import authMenuList from '@/assets/json/authMenuList.json';

/**
 * @name AuthModule
 */
// User login
export const loginApi = (params: ReqLogin) => {
  return http.post<ResLogin>('/login', params);
};

// Get menu list
export const getAuthMenuListApi = () => {
  // return http.get('/menu/list');
  return authMenuList;
};

// Get button permissions
export const getAuthButtonListApi = () => {
  // return http.get('/auth/buttons');
  return authButtonList;
};

// User logout
export const logoutApi = () => {
  return http.post('/logout', {}, { loading: true });
};
