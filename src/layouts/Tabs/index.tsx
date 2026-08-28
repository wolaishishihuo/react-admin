import { Icon as SvgIcon } from '@iconify/react/offline';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { useAuthorizedNavigation } from '@/features/navigation/menu-model';
import { useAdminLayoutStore } from '@/stores/modules/admin-layout.store';
import { navigateTo } from '@/router/router-ref';
import { useRoute } from '@/router/use-route';
import { getTabId } from '@/stores/modules/tab-identity';
import { buildTabFromRoute, getVisibleTabs, removeTab, upsertTab, useTabsStore, validateTabs } from '@/stores/modules/tabs.store';
import TabContextMenu from './components/TabContextMenu';
import './index.less';

export default function LayoutTabs() {
  const router = useRouter();
  const route = useRoute();
  const { isSuccess: isNavigationReady, pathMap, pathSet } = useAuthorizedNavigation();
  const tabsEnabled = useAdminLayoutStore(state => state.tabs);
  const homeTab = useTabsStore(state => state.homeTab);
  const tabs = useTabsStore(state => state.tabs);
  const tabsList = getVisibleTabs({ homeTab, tabs });
  const listRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);

  const staticData = route.staticData;
  const routePath = route.originPath;
  const fullPath = route.fullPath;
  const menuItem = pathMap.get(routePath);
  const title = menuItem?.title ?? staticData.title;
  const multi = Boolean(menuItem?.multi ?? staticData.tab?.multi);
  const activeId = getTabId(routePath, multi, fullPath);
  // 菜单项有值（含 false）就用菜单项；只有菜单里没有这条 path 时才回落 staticData
  const keepAlive = Boolean(menuItem?.keepAlive ?? staticData.keepAlive);

  useEffect(() => {
    if (!isNavigationReady) return;
    validateTabs(pathSet);
    if (!pathSet.has(routePath)) void router.invalidate();
  }, [isNavigationReady, pathSet, routePath, router]);

  useEffect(() => {
    if (!title) return;
    upsertTab(
      buildTabFromRoute({
        title,
        routePath,
        fullPath,
        multi,
        fixed: Boolean(staticData.tab?.fixed ?? menuItem?.fixed),
        keepAlive
      })
    );
  }, [title, staticData.tab?.fixed, routePath, fullPath, keepAlive, multi, menuItem?.fixed]);

  useEffect(() => {
    listRef.current?.querySelector('.tabs-item-active')?.scrollIntoView({
      behavior: isFirstScroll.current ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest'
    });
    isFirstScroll.current = false;
  }, [activeId, tabsList.length]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (list.scrollWidth <= list.clientWidth) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      list.scrollLeft += delta;
    };
    list.addEventListener('wheel', handleWheel, { passive: false });
    return () => list.removeEventListener('wheel', handleWheel);
  }, [tabsEnabled]);

  if (!tabsEnabled) return null;

  return (
    <div className='tabs-box px-20px pb-12px flex gap-8px select-none items-center lt-sm:px-15px'>
      <div className='tabs-list flex flex-1 gap-6px items-center overflow-x-auto scrollbar-hide' ref={listRef}>
        {tabsList.map(item => (
          <TabContextMenu key={item.id} path={item.id} activePath={activeId}>
            <div className='shrink-0'>
              <button
                type='button'
                className={clsx(
                  'tabs-item text-12px text-icon px-8px pl-12px chip shrink-0 gap-6px hover:text-primary-text',
                  item.fixed && 'tabs-item-affix',
                  item.id === activeId && 'tabs-item-active'
                )}
                data-tab-id={item.id}
                onClick={() => {
                  void navigateTo(item.fullPath);
                }}
              >
                <span className='whitespace-nowrap'>{item.title}</span>
                {!item.fixed && tabsList.length > 1 && (
                  <span
                    className={clsx(
                      'tabs-item-close text-10px text-icon rd-full flex-center h-16px w-16px transition-all hover:text-content -mr-4px hover:bg-active',
                      item.id === activeId && 'tabs-item-close-active'
                    )}
                    onClick={event => {
                      event.stopPropagation();
                      removeTab(item.id, activeId);
                    }}
                  >
                    <SvgIcon icon='ri:close-large-fill' />
                  </span>
                )}
              </button>
            </div>
          </TabContextMenu>
        ))}
      </div>
      <TabContextMenu path={activeId} activePath={activeId} trigger={['click']} placement='bottomRight'>
        <div className='chip-btn shrink-0'>
          <SvgIcon className='text-24px text-icon' icon='ri:arrow-down-s-line' />
        </div>
      </TabContextMenu>
    </div>
  );
}
