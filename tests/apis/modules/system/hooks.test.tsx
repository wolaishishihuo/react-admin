import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useDeleteRolesMutation, useRoleOptionsQuery, useSaveRoleMutation } from '@/apis/modules/system';
import { resetSystemMock } from '@/apis/modules/system/mock';
import { createQueryClient } from '@/apis/query';

function createWrapper() {
  const queryClient = createQueryClient();
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('system role query & mutation hooks', () => {
  beforeEach(() => {
    resetSystemMock();
  });

  it('fetches role options and refreshes them after creating or deleting a role', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => ({
        optionsQuery: useRoleOptionsQuery(true),
        saveRole: useSaveRoleMutation(),
        deleteRoles: useDeleteRolesMutation()
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.optionsQuery.isSuccess).toBe(true);
    });
    const initialCount = result.current.optionsQuery.data?.length ?? 0;

    let createdId = '';
    await act(async () => {
      const created = await result.current.saveRole.mutateAsync({
        roleName: '审计员',
        roleCode: 'auditor',
        status: 1,
        remark: '',
        menuIds: ['home']
      });
      createdId = created?.id ?? '';
    });

    await waitFor(() => {
      expect(result.current.optionsQuery.data?.some(item => item.label === '审计员')).toBe(true);
    });

    await act(async () => {
      await result.current.deleteRoles.mutateAsync([createdId]);
    });

    await waitFor(() => {
      expect(result.current.optionsQuery.data?.length).toBe(initialCount);
    });
  });
});
