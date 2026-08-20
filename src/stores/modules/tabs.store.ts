/**
 * 后台 Tabs 的唯一状态与导航 owner：持久化标签身份，维护关闭规则和页面刷新 revision。
 * routePath 用于权限校验，id/fullPath 用于 multi Tab、缓存和实际导航。
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { navigateTo } from '@/router/router-ref';
import { PERSIST_VERSION } from '@/stores/persist';
import { getTabId } from './tab-identity';
import type { AdminTab, TabsPersistedState } from './tabs.types';

interface TabsState extends TabsPersistedState {
  contentRevision: Record<string, number>;
}

interface TabsStore extends TabsState {
  upsertTab: (tab: AdminTab) => void;
  removeTab: (id: string, activeId: string) => void;
  closeTabsOnSide: (id: string, type: 'left' | 'right', activeId: string) => void;
  closeOtherTabs: (id: string, activeId: string) => void;
  closeAllTabs: (activeId: string) => void;
  validateTabs: (authorizedRoutePaths: Set<string>) => void;
  setTabTitle: (id: string, title: string) => void;
  bumpContentRevision: (id: string) => void;
  resetTransientTabs: () => void;
}

export const HOME_TAB: AdminTab = {
  id: '/home',
  routePath: '/home',
  fullPath: '/home',
  title: '首页',
  oldTitle: '首页',
  icon: 'ri:home-smile-2-line',
  fixed: true,
  keepAlive: false
};

export function getVisibleTabs(state: TabsPersistedState): AdminTab[] {
  return [state.homeTab, ...state.tabs.filter(tab => tab.id !== state.homeTab.id)];
}

function withoutRevisions(contentRevision: Record<string, number>, removed: Set<string>) {
  return Object.fromEntries(Object.entries(contentRevision).filter(([key]) => !removed.has(key)));
}

function navigateIfRemoved(visible: AdminTab[], activeId: string, fallbackId?: string) {
  // 只有当前 Tab 被删除时才导航，批量关闭非活动标签不能改变当前页面。
  if (visible.some(tab => tab.id === activeId)) return;
  const next = (fallbackId ? visible.find(tab => tab.id === fallbackId) : undefined) ?? visible.at(-1) ?? HOME_TAB;
  void navigateTo(next.fullPath);
}

export const useTabsStore = create<TabsStore>()(
  persist(
    (set, get) => ({
      homeTab: HOME_TAB,
      tabs: [],
      contentRevision: {},
      upsertTab: tab => {
        if (tab.fixed && tab.routePath === HOME_TAB.routePath) {
          set({ homeTab: { ...get().homeTab, ...tab, id: HOME_TAB.id, fixed: true } });
          return;
        }
        const oldTabs = get().tabs;
        const existing = oldTabs.find(item => item.id === tab.id);
        if (!existing) {
          set({ tabs: [...oldTabs, tab] });
          return;
        }
        // 原位更新已有 Tab，避免路由信息变化导致标签顺序跳动。
        set({ tabs: oldTabs.map(item => (item.id === tab.id ? { ...item, ...tab } : item)) });
      },
      removeTab: (id, activeId) => {
        const visible = getVisibleTabs(get());
        const target = visible.find(tab => tab.id === id);
        if (!target || target.fixed) return;
        const nextVisible = visible.filter(tab => tab.id !== id);
        set({
          tabs: get().tabs.filter(tab => tab.id !== id),
          contentRevision: withoutRevisions(get().contentRevision, new Set([id]))
        });
        navigateIfRemoved(nextVisible, activeId);
      },
      closeTabsOnSide: (id, type, activeId) => {
        const visible = getVisibleTabs(get());
        const currentIndex = visible.findIndex(tab => tab.id === id);
        if (currentIndex === -1) return;
        const range = type === 'left' ? [0, currentIndex] : [currentIndex + 1, visible.length];
        const removed = new Set(
          visible.filter((tab, index) => index >= range[0] && index < range[1] && !tab.fixed).map(tab => tab.id)
        );
        const nextTabs = get().tabs.filter(tab => !removed.has(tab.id));
        set({
          tabs: nextTabs,
          contentRevision: withoutRevisions(get().contentRevision, removed)
        });
        navigateIfRemoved(getVisibleTabs({ homeTab: get().homeTab, tabs: nextTabs }), activeId, id);
      },
      closeOtherTabs: (id, activeId) => {
        const keep = new Set([HOME_TAB.id, id]);
        const nextTabs = get().tabs.filter(tab => tab.fixed || keep.has(tab.id));
        set({
          tabs: nextTabs,
          contentRevision: Object.fromEntries(
            Object.entries(get().contentRevision).filter(([key]) => keep.has(key) || nextTabs.some(tab => tab.id === key))
          )
        });
        navigateIfRemoved(getVisibleTabs({ homeTab: get().homeTab, tabs: nextTabs }), activeId, id);
      },
      closeAllTabs: activeId => {
        const nextTabs = get().tabs.filter(tab => tab.fixed);
        const removed = new Set(
          get()
            .tabs.filter(tab => !tab.fixed)
            .map(tab => tab.id)
        );
        set({
          tabs: nextTabs,
          contentRevision: withoutRevisions(get().contentRevision, removed)
        });
        navigateIfRemoved(getVisibleTabs({ homeTab: get().homeTab, tabs: nextTabs }), activeId, HOME_TAB.id);
      },
      validateTabs: authorizedRoutePaths => {
        // 权限按不含 search 的 routePath 校验，不能使用可能包含查询参数的 Tab id。
        const removed = new Set(
          get()
            .tabs.filter(tab => !authorizedRoutePaths.has(tab.routePath))
            .map(tab => tab.id)
        );
        if (removed.size === 0) return;
        set({
          tabs: get().tabs.filter(tab => !removed.has(tab.id)),
          contentRevision: withoutRevisions(get().contentRevision, removed)
        });
      },
      setTabTitle: (id, title) => {
        if (id === get().homeTab.id) {
          set({ homeTab: { ...get().homeTab, title } });
          return;
        }
        set({
          tabs: get().tabs.map(tab => (tab.id === id ? { ...tab, oldTitle: tab.oldTitle || tab.title, title } : tab))
        });
      },
      bumpContentRevision: id => {
        set({ contentRevision: { ...get().contentRevision, [id]: (get().contentRevision[id] ?? 0) + 1 } });
      },
      resetTransientTabs: () => {
        set({ tabs: [], contentRevision: {}, homeTab: HOME_TAB });
      }
    }),
    {
      name: 'tabs-state',
      version: PERSIST_VERSION,
      partialize: state => ({
        homeTab: state.homeTab,
        tabs: state.tabs
      })
    }
  )
);

export function upsertTab(tab: AdminTab) {
  useTabsStore.getState().upsertTab(tab);
}

export function removeTab(id: string, activeId: string) {
  useTabsStore.getState().removeTab(id, activeId);
}

export function closeTabsOnSide(id: string, type: 'left' | 'right', activeId: string) {
  useTabsStore.getState().closeTabsOnSide(id, type, activeId);
}

export function closeOtherTabs(id: string, activeId: string) {
  useTabsStore.getState().closeOtherTabs(id, activeId);
}

export function closeAllTabs(activeId: string) {
  useTabsStore.getState().closeAllTabs(activeId);
}

export function validateTabs(authorizedRoutePaths: Set<string>) {
  useTabsStore.getState().validateTabs(authorizedRoutePaths);
}

export function setTabTitle(id: string, title: string) {
  useTabsStore.getState().setTabTitle(id, title);
}

export function bumpContentRevision(id: string) {
  useTabsStore.getState().bumpContentRevision(id);
}

export function resetTransientTabs() {
  useTabsStore.getState().resetTransientTabs();
}

export function buildTabFromRoute(options: {
  title: string;
  routePath: string;
  fullPath: string;
  multi: boolean;
  fixed?: boolean;
  keepAlive?: boolean;
  icon?: string;
}): AdminTab {
  const id = getTabId(options.routePath, options.multi, options.fullPath);
  return {
    id,
    routePath: options.routePath,
    fullPath: options.fullPath,
    title: options.title,
    oldTitle: options.title,
    icon: options.icon,
    fixed: Boolean(options.fixed),
    keepAlive: Boolean(options.keepAlive)
  };
}
