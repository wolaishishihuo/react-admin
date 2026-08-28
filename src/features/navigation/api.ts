/** 菜单 HTTP。对接真实后端时替换本文件。 */
import api from '@/services/http';
import type { BackendRouteResponse } from './types';

export function getAuthMenuListApi() {
  if (localStorage.getItem('mockMenuFail') === '1') {
    return Promise.reject(new Error('模拟菜单请求失败'));
  }
  return api.get<BackendRouteResponse>({ url: '/menu/list' });
}
