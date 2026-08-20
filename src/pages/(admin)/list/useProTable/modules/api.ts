import api from '@/services/http';
import type { ReqUserList, ResPage, UserItem } from './types';

export function fetchUserList(query: ReqUserList) {
  return api.get<ResPage<UserItem>>({ url: '/user/list', params: query });
}

export function fetchUserDetail(id: string) {
  return api.get<UserItem | null>({ url: '/user/detail', params: { id } });
}

export function createUser(data: Omit<UserItem, 'id' | 'createTime'>) {
  return api.post<UserItem>({ url: '/user', data });
}

export function updateUser(data: UserItem) {
  return api.put<UserItem | null>({ url: '/user', data });
}

export function deleteUsers(ids: string[]) {
  return api.del({ url: '/user', data: { ids } });
}
