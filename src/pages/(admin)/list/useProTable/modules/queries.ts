import { queryOptions } from '@tanstack/react-query';
import { fetchUserList } from './api';
import type { ReqUserList } from './types';

export function userListQueryKey(query: ReqUserList) {
  return ['user-list', query] as const;
}

export function userListOptions(query: ReqUserList) {
  return queryOptions({
    queryKey: userListQueryKey(query),
    queryFn: () => fetchUserList(query),
    retry: false
  });
}
