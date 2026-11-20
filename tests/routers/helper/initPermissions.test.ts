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

import { initPermissions } from '@/routers/helper/initPermissions';
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

describe('initPermissions', () => {
  afterEach(() => {
    useUserStore.setState({ token: '', refreshToken: '', userInfo: { name: '' } });
    useAuthStore.setState({ authMenuList: [], showMenuList: [], flatMenuList: [], authButtons: [] });
    vi.clearAllMocks();
  });

  it('stores all returned backend menus without hardcoded template whitelist filtering', async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ name: 'alice', buttons: ['order:create'] });
    mockGetAuthMenuList.mockResolvedValueOnce([
      { path: '/order/list', meta: { key: 'order', title: '订单管理' } },
      { path: '/fleet/overview', meta: { title: '车队概览' } }
    ]);

    useUserStore.setState({ token: 'token-1', refreshToken: 'refresh-1' });
    await initPermissions('token-1');

    expect(useUserStore.getState().userInfo.name).toBe('alice');
    expect(useAuthStore.getState().authButtons).toEqual(['order:create']);
    expect(useAuthStore.getState().authMenuList.map(item => item.path)).toEqual(['/order/list', '/fleet/overview']);
  });

  it('resets auth state and rejects when menu list is empty', async () => {
    mockGetCurrentUser.mockResolvedValueOnce({ name: 'empty-user', buttons: ['any'] });
    mockGetAuthMenuList.mockResolvedValueOnce([]);

    useUserStore.setState({ token: 'token-empty', refreshToken: 'refresh-empty' });
    await expect(initPermissions('token-empty')).rejects.toThrow('No permission');

    expect(mockNotifyWarning).toHaveBeenCalledOnce();
    expect(useUserStore.getState().token).toBe('');
    expect(useUserStore.getState().userInfo.name).toBe('');
    expect(useAuthStore.getState().authButtons).toEqual([]);
    expect(useAuthStore.getState().authMenuList).toEqual([]);
  });

  it('discards stale permission responses when account switches mid-flight', async () => {
    const userReqA = deferred<{ name: string; buttons: string[] }>();
    const menuReqA = deferred<Array<{ path: string; meta: { key: string; title: string } }>>();

    mockGetCurrentUser.mockReturnValueOnce(userReqA.promise);
    mockGetAuthMenuList.mockReturnValueOnce(menuReqA.promise);

    useUserStore.setState({ token: 'token-A', refreshToken: 'refresh-A', userInfo: { name: '' } });
    const pendingA = initPermissions('token-A');

    useUserStore.setState({ token: 'token-B', refreshToken: 'refresh-B', userInfo: { name: 'user-B' } });
    useAuthStore.getState().setAuthButtons(['b:only']);

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
    const pendingA = initPermissions('token-A');

    useUserStore.setState({ token: 'token-B', refreshToken: 'refresh-B', userInfo: { name: 'user-B' } });

    userReqA.reject(new Error('canceled'));
    await expect(pendingA).rejects.toThrow('canceled');

    expect(useUserStore.getState().token).toBe('token-B');
    expect(useUserStore.getState().refreshToken).toBe('refresh-B');
    expect(useUserStore.getState().userInfo.name).toBe('user-B');
  });
});
