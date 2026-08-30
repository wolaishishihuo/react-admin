import { queryOptions, useQuery } from '@tanstack/react-query';

import { ReqPage } from '@/apis/interface';

import { fetchGetUserList } from './api';
import { USER_QUERY_KEYS } from './keys';

export function queryUserListOptions(params: ReqPage) {
  return queryOptions({
    queryFn: () => fetchGetUserList(params),
    queryKey: USER_QUERY_KEYS.LIST(params)
  });
}

export function useUserListQuery(params: ReqPage) {
  return useQuery(queryUserListOptions(params));
}
