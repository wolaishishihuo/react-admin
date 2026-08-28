import type { AuthUser } from '@/features/auth/types';
import type { AuthorizedNavigation } from '@/features/navigation/types';

export interface RouteMeta {
  /** 文档标题、Tab 名；分组 layout 必须有，否则侧边栏没有这一级 */
  title?: string;
  /** 当前页是否走缓存 pane；Tab 上的 keepAlive 仍以菜单项为准 */
  keepAlive?: boolean | null;
  /** 外链。守卫从后往前找带 href 的 match，不要写在分组 layout 上 */
  href?: string;
  /** 页内 iframe 地址。只是元信息，页面用 IframeRoutePage / IframePage 自己渲染 */
  url?: string;
  menu?: {
    icon?: string;
    hide?: boolean | null;
    order?: number | null;
    /** 隐藏页进入时侧边栏该高亮的 path */
    activeMenu?: string | null;
  };
  tab?: {
    /** true：每个完整 URL 一个 Tab，详情页用 */
    multi?: boolean | null;
    fixed?: boolean | null;
  };
  /** static 模式的按钮码；dynamic 读菜单 handle.buttons */
  buttons?: string[];
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
