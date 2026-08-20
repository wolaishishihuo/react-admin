import api from '@/services/http';
import type { BackendMenuItem } from './types';

export function getAuthMenuListApi() {
  if (localStorage.getItem('mockMenuFail') === '1') {
    return Promise.reject(new Error('模拟菜单请求失败'));
  }
  return api.get<BackendMenuItem[]>({ url: '/menu/list' });
}
