/**
 * 认证会话协调层：串联 token、用户 Query、授权菜单、Tabs 隔离与登出清理。
 * 初始化任务绑定 session epoch，避免旧 token 的迟到请求污染当前会话。
 */
import { queryClient } from '@/services/query/client';
import { LOGIN_PATH } from '@/features/navigation/menu-normalize';
import { ensureAuthorizedNavigation } from '@/features/navigation/menu-query';
import { navigateTo, getRouter } from '@/router/router-ref';
import {
  getLastLoginUserId,
  getRefreshToken,
  getSessionEpoch,
  getToken,
  isSessionInitialized,
  setLastLoginUserId,
  setAuthTokens,
  setRefreshedAuthTokens,
  setSessionInitialized
} from '@/stores/modules/session.store';
import { resetTransientTabs } from '@/stores/modules/tabs.store';
import { cancelAllRequest } from '@/services/http/cancel';
import { resetTokenRefresh } from '@/services/http/unauthorized';
import { authUserQueryOptions } from './queries';
import { logoutApi, refreshTokenApi } from './api';
import type { AuthTokens, AuthUser } from './types';

let initializeInFlight: Promise<AuthUser | null> | null = null;
let inFlightKey: string | null = null;

function sessionFlightKey() {
  return String(getSessionEpoch());
}

export function isAuthInitialized() {
  return isSessionInitialized();
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function applyAuthToken(token: string) {
  applyAuthTokens({ token });
}

export function applyAuthTokens(tokens: AuthTokens) {
  if (getToken() !== tokens.token) setSessionInitialized(false);
  setAuthTokens(tokens);
}

function isolateUserChange(previousUserId: string, nextUserId: string) {
  if (previousUserId && previousUserId === nextUserId) return;
  // 换用户时清理旧页面状态和缓存，但保留当前会话已加载的 user/menu Query。
  resetTransientTabs();
  const currentSessionEpoch = getSessionEpoch();
  queryClient.removeQueries({
    predicate: query => {
      if (query.queryKey[0] === 'navigation' && query.queryKey[2] === currentSessionEpoch) return false;
      if (query.queryKey[0] === 'auth' && query.queryKey[2] === currentSessionEpoch) return false;
      return true;
    }
  });
}

export async function initializeSession(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) {
    setSessionInitialized(false);
    return null;
  }

  const key = sessionFlightKey();
  // 同一会话复用初始化任务；epoch 或 token 变化后，旧任务只能返回 null。
  if (initializeInFlight && inFlightKey === key) return initializeInFlight;

  const cached = (queryClient.getQueryData(authUserQueryOptions().queryKey) as AuthUser | undefined) ?? null;
  if (isSessionInitialized() && cached) {
    await ensureAuthorizedNavigation(queryClient, getRouter());
    return cached;
  }

  inFlightKey = key;
  initializeInFlight = (async () => {
    try {
      const user = await queryClient.ensureQueryData(authUserQueryOptions());
      if (sessionFlightKey() !== key) return null;
      if (!user) {
        await clearLocalSession();
        return null;
      }

      await ensureAuthorizedNavigation(queryClient, getRouter());
      if (sessionFlightKey() !== key) return null;

      setSessionInitialized(true);
      return user;
    } catch (error) {
      if (sessionFlightKey() !== key) return null;
      throw error;
    } finally {
      if (inFlightKey === key) {
        initializeInFlight = null;
        inFlightKey = null;
      }
    }
  })();

  return initializeInFlight;
}

export async function establishSession(tokens: AuthTokens): Promise<AuthUser | null> {
  const previousUserId = getLastLoginUserId();
  resetTokenRefresh();
  applyAuthTokens(tokens);
  const user = await initializeSession();
  if (!user) return null;
  isolateUserChange(previousUserId, user.id);
  setLastLoginUserId(user.id);
  return user;
}

export async function refreshCurrentToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const key = sessionFlightKey();

  try {
    const tokens = await refreshTokenApi(refreshToken);
    if (sessionFlightKey() !== key) return Boolean(getToken());
    setRefreshedAuthTokens(tokens);
    return true;
  } catch {
    if (sessionFlightKey() !== key) return Boolean(getToken());
    return false;
  }
}

export async function clearLocalSession() {
  resetTokenRefresh();
  setSessionInitialized(false);
  cancelAllRequest();
  queryClient.clear();
  initializeInFlight = null;
  inFlightKey = null;
  setAuthTokens({ token: '' });
}

export async function revokeSession() {
  if (!getToken()) {
    await clearLocalSession();
    return;
  }
  // 先终止旧业务请求；cancelAllRequest 会换新 signal，因此登出请求仍可正常发出。
  cancelAllRequest();
  try {
    await logoutApi();
  } catch {
    // 服务端失败静默
  }
  await clearLocalSession();
}

export async function expireCurrentSession() {
  await clearLocalSession();
  await navigateTo(LOGIN_PATH, { replace: true });
}

export async function logoutSession() {
  await revokeSession();
  await navigateTo(LOGIN_PATH, { replace: true });
}
