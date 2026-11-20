import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ReqCreateRole, RoleItem } from '@/apis/interface';

import { fetchCreateRole, fetchDeleteRole, fetchGetRoleOptions, fetchUpdateRole } from './api';
import { SYSTEM_QUERY_KEYS } from './keys';

export function queryRoleOptions() {
  return queryOptions({
    queryKey: SYSTEM_QUERY_KEYS.ROLE_OPTIONS,
    queryFn: ({ signal }) => fetchGetRoleOptions(signal)
  });
}

export function useRoleOptionsQuery(enabled = true) {
  return useQuery({
    ...queryRoleOptions(),
    enabled
  });
}

export function useSaveRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReqCreateRole | RoleItem): Promise<RoleItem | void> =>
      'id' in payload ? fetchUpdateRole(payload) : fetchCreateRole(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.ROLE_OPTIONS });
    }
  });
}

export function useDeleteRolesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(id => fetchDeleteRole(id))),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SYSTEM_QUERY_KEYS.ROLE_OPTIONS });
    }
  });
}
