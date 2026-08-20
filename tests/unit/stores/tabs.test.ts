import { beforeEach, describe, expect, it, vi } from 'vitest';
import { navigateTo } from '@/router/router-ref';
import { getTabId } from '@/stores/modules/tab-identity';
import { HOME_TAB, getVisibleTabs, useTabsStore } from '@/stores/modules/tabs.store';

vi.mock('@/router/router-ref', () => ({
  navigateTo: vi.fn()
}));

const listTab = {
  id: '/list/useProTable',
  routePath: '/list/useProTable',
  fullPath: '/list/useProTable',
  title: '用户列表',
  oldTitle: '用户列表',
  fixed: false,
  keepAlive: true
};

const detailTab = {
  id: '/list/useProTable/detail?id=1',
  routePath: '/list/useProTable/detail',
  fullPath: '/list/useProTable/detail?id=1',
  title: '详情',
  oldTitle: '详情',
  fixed: false,
  keepAlive: true
};

const otherTab = {
  id: '/users/$userId',
  routePath: '/users/$userId',
  fullPath: '/users/1',
  title: '用户资料',
  oldTitle: '用户资料',
  fixed: false,
  keepAlive: true
};

describe('tabs store', () => {
  beforeEach(() => {
    vi.mocked(navigateTo).mockClear();
    useTabsStore.setState({
      homeTab: HOME_TAB,
      tabs: [],
      contentRevision: {}
    });
  });

  it('列表 query 变化仍是同一 id', () => {
    expect(getTabId('/list/useProTable', false, '/list/useProTable?page=1')).toBe('/list/useProTable');
    expect(getTabId('/users/$userId', false, '/users/1')).toBe('/users/$userId');
    expect(getTabId('/users/$userId', false, '/users/2')).toBe('/users/$userId');
  });

  it('详情 multi 使用 fullPath', () => {
    expect(getTabId('/list/useProTable/detail', true, '/list/useProTable/detail?id=1')).toBe('/list/useProTable/detail?id=1');
    expect(getTabId('/users/$userId', true, '/users/1')).toBe('/users/1');
    expect(getTabId('/users/$userId', true, '/users/2')).toBe('/users/2');
  });

  it('已存在 Tab 原位更新且不改变顺序', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab, otherTab] });
    useTabsStore.getState().upsertTab({ ...listTab, title: '用户列表（新）' });
    expect(useTabsStore.getState().tabs.map(tab => tab.id)).toEqual([
      '/list/useProTable',
      '/list/useProTable/detail?id=1',
      '/users/$userId'
    ]);
    expect(useTabsStore.getState().tabs[0]?.title).toBe('用户列表（新）');
  });

  it('重新激活相同地址时保留运行时标题', () => {
    useTabsStore.getState().upsertTab(detailTab);
    useTabsStore.getState().setTabTitle(detailTab.id, '详情 - user_01');

    useTabsStore.getState().upsertTab(detailTab);

    expect(useTabsStore.getState().tabs[0]).toMatchObject({
      title: '详情 - user_01',
      oldTitle: '详情'
    });
  });

  it('普通 Tab 切换到新地址时恢复路由默认标题', () => {
    useTabsStore.getState().upsertTab(otherTab);
    useTabsStore.getState().setTabTitle(otherTab.id, '详情 - user_01');

    useTabsStore.getState().upsertTab({ ...otherTab, fullPath: '/users/2' });

    expect(useTabsStore.getState().tabs[0]).toMatchObject({
      fullPath: '/users/2',
      title: '用户资料',
      oldTitle: '用户资料'
    });
  });

  it('关闭当前非固定 Tab 导航到邻居', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab] });
    useTabsStore.getState().removeTab(listTab.id, listTab.id);
    expect(useTabsStore.getState().tabs.map(tab => tab.id)).toEqual([detailTab.id]);
    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith(detailTab.fullPath);
  });

  it('关闭非当前 Tab 不导航', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab] });
    useTabsStore.getState().removeTab(detailTab.id, listTab.id);
    expect(navigateTo).not.toHaveBeenCalled();
    expect(useTabsStore.getState().tabs.map(tab => tab.id)).toEqual([listTab.id]);
  });

  it('关闭左侧只删非固定，当前被删才导航', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab, otherTab] });
    useTabsStore.getState().closeTabsOnSide(otherTab.id, 'left', listTab.id);
    expect(useTabsStore.getState().tabs.map(tab => tab.id)).toEqual([otherTab.id]);
    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith(otherTab.fullPath);
  });

  it('关闭右侧不包含当前时不导航', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab, otherTab] });
    useTabsStore.getState().closeTabsOnSide(listTab.id, 'right', listTab.id);
    expect(useTabsStore.getState().tabs.map(tab => tab.id)).toEqual([listTab.id]);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('关闭其它保留 fixed 与当前', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab] });
    useTabsStore.getState().closeOtherTabs(listTab.id, listTab.id);
    const ids = getVisibleTabs(useTabsStore.getState()).map(tab => tab.id);
    expect(ids).toEqual(['/home', '/list/useProTable']);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('关闭其它时若当前被删则只导航一次到保留 Tab', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab] });
    useTabsStore.getState().closeOtherTabs(listTab.id, detailTab.id);
    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith(listTab.fullPath);
  });

  it('关闭全部只导航一次，且当前 fixed 被保留时不回首页', () => {
    const fixedList = { ...listTab, fixed: true };
    useTabsStore.setState({ tabs: [fixedList, detailTab] });
    useTabsStore.getState().closeAllTabs(fixedList.id);
    expect(useTabsStore.getState().tabs).toEqual([fixedList]);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('关闭全部在当前非固定 Tab 被删时回首页一次', () => {
    useTabsStore.setState({ tabs: [listTab, detailTab] });
    useTabsStore.getState().closeAllTabs(listTab.id);
    expect(useTabsStore.getState().tabs).toEqual([]);
    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith(HOME_TAB.fullPath);
  });

  it('按 routePath 校验，带 query 的详情不误删', () => {
    useTabsStore.setState({
      tabs: [detailTab]
    });
    useTabsStore.getState().validateTabs(new Set(['/home', '/list/useProTable/detail']));
    expect(useTabsStore.getState().tabs).toHaveLength(1);
    useTabsStore.getState().validateTabs(new Set(['/home']));
    expect(useTabsStore.getState().tabs).toHaveLength(0);
  });

  it('权限校验删除未授权 fixed Tab 和对应缓存 revision，但保留独立 homeTab', () => {
    const fixedList = { ...listTab, fixed: true };
    useTabsStore.setState({
      tabs: [fixedList, detailTab],
      contentRevision: { [fixedList.id]: 1, [detailTab.id]: 2 }
    });

    useTabsStore.getState().validateTabs(new Set([detailTab.routePath]));

    expect(getVisibleTabs(useTabsStore.getState()).map(tab => tab.id)).toEqual([HOME_TAB.id, detailTab.id]);
    expect(useTabsStore.getState().contentRevision).toEqual({ [detailTab.id]: 2 });
  });
});
