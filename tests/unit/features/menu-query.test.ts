import { QueryClient } from '@tanstack/react-query';
import type { AnyRouter } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthMenuListApi } from '@/features/navigation/api';
import { ensureAuthorizedNavigation } from '@/features/navigation/menu-query';
import { setToken, useSessionStore } from '@/stores/modules/session.store';

vi.mock('@/features/navigation/api', () => ({
  getAuthMenuListApi: vi.fn()
}));

const router = {
  routeTree: {
    fullPath: '/',
    children: [{ fullPath: '/home' }, { fullPath: '/users' }]
  }
} as unknown as AnyRouter;

describe('navigation query session isolation', () => {
  beforeEach(() => {
    useSessionStore.setState({ token: '', refreshToken: '', sessionEpoch: 0, initialized: false, lastLoginUserId: '' });
    vi.mocked(getAuthMenuListApi).mockReset();
  });

  it('token 变化后重新获取当前用户菜单', async () => {
    const client = new QueryClient();
    vi.mocked(getAuthMenuListApi)
      .mockResolvedValueOnce([{ path: '/home', meta: { title: '首页' } }])
      .mockResolvedValueOnce([{ path: '/users', meta: { title: '用户' } }]);

    setToken('token-a');
    const first = await ensureAuthorizedNavigation(client, router);
    setToken('token-b');
    const second = await ensureAuthorizedNavigation(client, router);

    expect(getAuthMenuListApi).toHaveBeenCalledTimes(2);
    expect(first.pathSet).toEqual(new Set(['/home']));
    expect(second.pathSet).toEqual(new Set(['/users']));
  });
});
