import { getSessionEpoch } from '@/stores/modules/session.store';
import { getUserInfoApi } from './api';
import type { AuthUser } from './types';

export const authUserQueryKey = ['auth', 'user'] as const;

export function authUserQueryOptions() {
  return {
    queryKey: [...authUserQueryKey, getSessionEpoch()] as const,
    queryFn: (): Promise<AuthUser | null> => getUserInfoApi(),
    staleTime: Infinity,
    retry: false
  };
}
