import type { AuthUser } from '@/features/auth/types';
import type { AuthorizedNavigation } from '@/features/navigation/types';

export interface RouteMeta {
  title?: string;
  keepAlive?: boolean;
  tab?: {
    multi?: boolean;
    fixed?: boolean;
  };
  activeMenu?: string;
}

export interface AppRouterContext {
  auth: {
    isLoggedIn: boolean;
    isInitialized: boolean;
    user: AuthUser | null;
    initialize: () => Promise<AuthUser | null>;
    revoke: () => Promise<void>;
  };
  navigation: {
    ensureMenu: () => Promise<AuthorizedNavigation>;
  };
}

export const initialRouterContext: AppRouterContext = {
  auth: {
    isLoggedIn: false,
    isInitialized: false,
    user: null,
    initialize: async () => null,
    revoke: async () => undefined
  },
  navigation: {
    ensureMenu: async () => ({
      tree: [],
      visibleTree: [],
      pathSet: new Set(),
      pathMap: new Map(),
      permissionMap: new Map()
    })
  }
};
