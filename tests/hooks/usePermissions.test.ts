import { afterEach, describe, expect, it, vi } from 'vitest';

const { mockGetCurrentUser, mockGetAuthMenuList, mockNotifyWarning } = vi.hoisted(() => ({
  mockGetCurrentUser: vi.fn(),
  mockGetAuthMenuList: vi.fn(),
  mockNotifyWarning: vi.fn()
}));

vi.mock('@/apis/modules/user', () => ({
  fetchGetCurrentUser: mockGetCurrentUser
}));

vi.mock('@/apis/modules/login', () => ({
  fetchGetAuthMenuList: mockGetAuthMenuList
}));

vi.mock('@/hooks/useMessage', () => ({
  notification: {
    warning: mockNotifyWarning
  }
}));

import usePermissions from '@/hooks/usePermissions';
import { useAuthStore, useUserStore } from '@/stores';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('usePermissions session race safety', () => {
  afterEach(() => {
    useUserStore.setState({ token: '', refreshToken: '', userInfo: { name: '' } });
    useAuthStore.setState({ authMenuList: [], showMenuList: [], flatMenuList: [], authButtons: [] });
    vi.clearAllMocks();
  });

  it('discards stale permission responses when account switches mid-flight', async () => {
    const userReqA = deferred<{ name: string; buttons: string[] }>();
    const menuReqA = deferred<Array<{ path: string; meta: { key: string; title: string } }>>();

    mockGetCurrentUser.mockReturnValueOnce(userReqA.promise);
    mockGetAuthMenuList.mockReturnValueOnce(menuReqA.promise);

    useUserStore.setState({ token: 'token-A', refreshToken: 'refresh-A', userInfo: { name: '' } });
    const { initPermissions } = usePermissions();
    const pendingA = initPermissions('token-A');

    // Mid-flight account switch to B
    useUserStore.setState({ token: 'token-B', refreshToken: 'refresh-B', userInfo: { name: 'user-B' } });
    useAuthStore.getState().setAuthButtons(['b:only']);

    // Stale A resolves after switch
    userReqA.resolve({ name: 'user-A', buttons: ['a:stale'] });
    menuReqA.resolve([{ path: '/home/index', meta: { key: 'home', title: '首页' } }]);
    await pendingA;

    expect(useUserStore.getState().token).toBe('token-B');
    expect(useUserStore.getState().userInfo.name).toBe('user-B');
    expect(useAuthStore.getState().authButtons).toEqual(['b:only']);
  });

  it('does not clear new session token when a stale permission request rejects', async () => {
    const userReqA = deferred<{ name: string; buttons: string[] }>();
    const menuReqA = deferred<Array<{ path: string; meta: { key: string; title: string } }>>();

    mockGetCurrentUser.mockReturnValueOnce(userReqA.promise);
    mockGetAuthMenuList.mockReturnValueOnce(menuReqA.promise);

    useUserStore.setState({ token: 'token-A', refreshToken: 'refresh-A' });
    const { initPermissions } = usePermissions();
    const pendingA = initPermissions('token-A');

    useUserStore.setState({ token: 'token-B', refreshToken: 'refresh-B', userInfo: { name: 'user-B' } });

    userReqA.reject(new Error('canceled'));
    await expect(pendingA).rejects.toThrow('canceled');

    expect(useUserStore.getState().token).toBe('token-B');
    expect(useUserStore.getState().refreshToken).toBe('refresh-B');
    expect(useUserStore.getState().userInfo.name).toBe('user-B');
  });
});
