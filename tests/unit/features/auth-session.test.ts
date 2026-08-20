import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '@/services/query/client';
import { getToken, isSessionInitialized, setLastLoginUserId, useSessionStore } from '@/stores/modules/session.store';
import { HOME_TAB, useTabsStore } from '@/stores/modules/tabs.store';
import { getUserInfoApi, logoutApi } from '@/features/auth/api';
import { authUserQueryOptions } from '@/features/auth/queries';
import {
  applyAuthToken,
  clearLocalSession,
  establishSession,
  expireCurrentSession,
  initializeSession,
  isAuthInitialized,
  logoutSession,
  revokeSession
} from '@/features/auth/session';
import { navigateTo } from '@/router/router-ref';

vi.mock('@/features/auth/api', () => ({
  getUserInfoApi: vi.fn(),
  logoutApi: vi.fn()
}));

vi.mock('@/features/navigation/menu-query', () => ({
  ensureAuthorizedNavigation: vi.fn().mockResolvedValue({
    tree: [],
    visibleTree: [],
    pathSet: new Set(),
    pathMap: new Map(),
    permissionMap: new Map()
  })
}));

vi.mock('@/router/router-ref', () => ({
  getRouter: vi.fn(() => ({})),
  navigateTo: vi.fn()
}));

const getUserInfoApiMock = vi.mocked(getUserInfoApi);
const logoutApiMock = vi.mocked(logoutApi);
const navigateToMock = vi.mocked(navigateTo);

describe('initializeSession', () => {
  beforeEach(() => {
    queryClient.clear();
    useSessionStore.setState({
      token: '',
      lastLoginUserId: '',
      sessionEpoch: 0,
      initialized: false
    });
    useTabsStore.setState({
      homeTab: HOME_TAB,
      tabs: [
        {
          ...HOME_TAB,
          id: '/list/useProTable',
          routePath: '/list/useProTable',
          fullPath: '/list/useProTable',
          title: '列表',
          oldTitle: '列表',
          fixed: false,
          keepAlive: true
        }
      ],
      contentRevision: {}
    });
    getUserInfoApiMock.mockReset();
    logoutApiMock.mockReset();
    navigateToMock.mockReset();
  });

  afterEach(async () => {
    await clearLocalSession();
  });

  it('user-info Query 显式 retry: false', () => {
    expect(authUserQueryOptions().retry).toBe(false);
  });

  it('401/null user 不自动重试', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });
    const queryFn = vi.fn().mockResolvedValue(null);
    await client.fetchQuery({ queryKey: ['auth', 'user', 'token'], queryFn, retry: false });
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('single-flight 并发 initialize 只请求一次', async () => {
    getUserInfoApiMock.mockResolvedValue({ id: '1', name: 'admin' });
    applyAuthToken('token-a');
    const [first, second] = await Promise.all([initializeSession(), initializeSession()]);
    expect(first?.id).toBe('1');
    expect(second?.id).toBe('1');
    expect(getUserInfoApiMock).toHaveBeenCalledTimes(1);
    expect(isAuthInitialized()).toBe(true);
  });

  it('user 为 null 时清会话', async () => {
    getUserInfoApiMock.mockResolvedValue(null);
    applyAuthToken('token-a');
    const user = await initializeSession();
    expect(user).toBeNull();
    expect(getToken()).toBe('');
    expect(isSessionInitialized()).toBe(false);
  });

  it('网络失败保留 token 且不标记 initialized', async () => {
    getUserInfoApiMock.mockRejectedValue(new Error('network'));
    applyAuthToken('token-a');
    await expect(initializeSession()).rejects.toThrow('network');
    expect(getToken()).toBe('token-a');
    expect(isAuthInitialized()).toBe(false);
  });

  it('旧请求迟到不得初始化已换 token 的 session', async () => {
    let resolveFirst!: (value: { id: string; name: string }) => void;
    getUserInfoApiMock
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveFirst = resolve;
          })
      )
      .mockResolvedValueOnce({ id: '2', name: 'user' });

    applyAuthToken('token-a');
    const first = initializeSession();
    applyAuthToken('token-b');
    const second = initializeSession();
    resolveFirst({ id: '1', name: 'admin' });

    expect(await first).toBeNull();
    expect((await second)?.id).toBe('2');
    expect(isAuthInitialized()).toBe(true);
    expect(getToken()).toBe('token-b');
  });

  it('同用户登录保留非固定 Tabs，换用户则清理', async () => {
    setLastLoginUserId('1');
    getUserInfoApiMock.mockResolvedValue({ id: '1', name: 'admin' });
    await establishSession('token-admin');
    expect(useTabsStore.getState().tabs).toHaveLength(1);
    queryClient.setQueryData(['navigation', 'menu', 'token-admin'], { owner: 'admin' });

    getUserInfoApiMock.mockResolvedValue({ id: '2', name: 'user' });
    await establishSession('token-user');
    expect(useTabsStore.getState().tabs).toEqual([]);
    expect(queryClient.getQueryData(['navigation', 'menu', 'token-admin'])).toBeUndefined();
  });

  it('Guard 会话撤销只清状态，不负责导航', async () => {
    applyAuthToken('token-a');
    await revokeSession();
    expect(logoutApiMock).toHaveBeenCalledTimes(1);
    expect(getToken()).toBe('');
    expect(navigateToMock).not.toHaveBeenCalled();
  });

  it('用户主动退出在撤销会话后只导航一次', async () => {
    applyAuthToken('token-a');
    await logoutSession();
    expect(logoutApiMock).toHaveBeenCalledTimes(1);
    expect(navigateToMock).toHaveBeenCalledTimes(1);
    expect(navigateToMock).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('HTTP 401 只清本地会话，不再调用登出接口', async () => {
    applyAuthToken('token-a');
    await expireCurrentSession();
    expect(logoutApiMock).not.toHaveBeenCalled();
    expect(getToken()).toBe('');
    expect(navigateToMock).toHaveBeenCalledTimes(1);
    expect(navigateToMock).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('token 已失效后撤销会话不再调用登出接口', async () => {
    await revokeSession();
    expect(logoutApiMock).not.toHaveBeenCalled();
    expect(navigateToMock).not.toHaveBeenCalled();
  });
});
