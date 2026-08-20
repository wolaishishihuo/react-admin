import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PERSIST_VERSION } from '@/stores/persist';

interface SessionPersistedState {
  token: string;
  refreshToken: string;
  lastLoginUserId: string;
}

interface SessionState extends SessionPersistedState {
  sessionEpoch: number;
  initialized: boolean;
}

interface SessionStore extends SessionState {
  setToken: (token: string) => void;
  setAuthTokens: (tokens: { refreshToken?: string; token: string }) => void;
  setRefreshedAuthTokens: (tokens: { refreshToken: string; token: string }) => void;
  setInitialized: (initialized: boolean) => void;
  setLastLoginUserId: (lastLoginUserId: string) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    set => ({
      token: '',
      refreshToken: '',
      lastLoginUserId: '',
      sessionEpoch: 0,
      initialized: false,
      setToken: token =>
        set(state => ({
          token,
          sessionEpoch: token === state.token ? state.sessionEpoch : state.sessionEpoch + 1,
          initialized: token === state.token ? state.initialized : false
        })),
      setAuthTokens: tokens =>
        set(state => ({
          token: tokens.token,
          refreshToken: tokens.refreshToken ?? '',
          sessionEpoch: tokens.token === state.token ? state.sessionEpoch : state.sessionEpoch + 1,
          initialized: tokens.token === state.token ? state.initialized : false
        })),
      setRefreshedAuthTokens: tokens => set(tokens),
      setInitialized: initialized => set({ initialized }),
      setLastLoginUserId: lastLoginUserId => set({ lastLoginUserId })
    }),
    {
      name: 'session-state',
      version: PERSIST_VERSION,
      partialize: state => ({
        token: state.token,
        refreshToken: state.refreshToken,
        lastLoginUserId: state.lastLoginUserId
      })
    }
  )
);

export const setToken = (token: string) => useSessionStore.getState().setToken(token);
export const setAuthTokens = (tokens: { refreshToken?: string; token: string }) =>
  useSessionStore.getState().setAuthTokens(tokens);
export const setRefreshedAuthTokens = (tokens: { refreshToken: string; token: string }) =>
  useSessionStore.getState().setRefreshedAuthTokens(tokens);
export const getToken = () => useSessionStore.getState().token;
export const getRefreshToken = () => useSessionStore.getState().refreshToken;
export const getSessionEpoch = () => useSessionStore.getState().sessionEpoch;
export const getLastLoginUserId = () => useSessionStore.getState().lastLoginUserId;
export const setLastLoginUserId = (userId: string) => useSessionStore.getState().setLastLoginUserId(userId);
export const setSessionInitialized = (initialized: boolean) => useSessionStore.getState().setInitialized(initialized);
export const isSessionInitialized = () => useSessionStore.getState().initialized;
