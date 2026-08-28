import './index.less';

import { Icon as SvgIcon } from '@iconify/react/offline';
import clsx from 'clsx';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { useLocation, useMatches, useNavigate } from 'react-router-dom';

import { type MetaProps } from '@/routers/interface';
import { useAuthStore, useGlobalStore, useTabsStore } from '@/stores';
import { getTabId } from '@/utils';

import TabContextMenu from './components/TabContextMenu';

const LayoutTabs: React.FC = () => {
  const matches = useMatches();
  const location = useLocation();
  const navigate = useNavigate();

  const path = getTabId(location.pathname + location.search);

  const tabs = useGlobalStore(state => state.tabs);
  const tabsList = useTabsStore(state => state.tabsList);
  const addTab = useTabsStore(state => state.addTab);
  const removeTab = useTabsStore(state => state.removeTab);
  const flatMenuList = useAuthStore(state => state.flatMenuList);

  const listRef = useRef<HTMLDivElement>(null);
  const isFirstScroll = useRef(true);

  useEffect(() => initTabs(), []);

  // 激活标签滚入可视区（横向溢出时）：首次挂载瞬时定位，路由切换平滑动画
  useEffect(() => {
    listRef.current?.querySelector('.tabs-item-active')?.scrollIntoView({
      behavior: isFirstScroll.current ? 'auto' : 'smooth',
      inline: 'nearest',
      block: 'nearest'
    });
    isFirstScroll.current = false;
  }, [path, tabsList.length]);

  // 滚轮横向滚动（React onWheel 为 passive，需原生监听才能 preventDefault）
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
  }, [tabs]);

  const initTabs = () => {
    flatMenuList.forEach(item => {
      if (item.meta?.isAffix && !item.meta.isHide && !item.meta.isFull) {
        const tabValue = {
          title: item.meta.title!,
          path: item.path!,
          closable: !item.meta.isAffix
        };
        addTab(tabValue);
      }
    });
  };

  // 追加当前标签；含首挂——登录后可能直接落在 redirect 目标页，那一页也要有标签
  useEffect(() => {
    const meta = matches[matches.length - 1].loaderData as MetaProps & { redirect: boolean };
    if (meta?.redirect) return;
    addTab({
      title: meta.title!,
      path: path,
      closable: !meta.isAffix
    });
  }, [matches]);

  const closeTab = (event: React.MouseEvent, targetPath: string) => {
    event.stopPropagation();
    removeTab({ path: targetPath, isCurrent: targetPath === path });
  };

  if (!tabs) return null;

  return (
    <div className='tabs-box px-20px pb-12px flex gap-8px select-none items-center lt-sm:px-15px'>
      <div className='tabs-list flex flex-1 gap-6px items-center overflow-x-auto scrollbar-hide' ref={listRef}>
        {tabsList.map(item => (
          <TabContextMenu key={item.path} path={item.path} activePath={path}>
            <div
              className={clsx(
                'tabs-item text-12px text-icon px-8px pl-12px chip shrink-0 gap-6px hover:text-primary-text',
                !item.closable && 'tabs-item-affix',
                item.path === path && 'tabs-item-active'
              )}
              onClick={() => item.path !== path && navigate(item.path)}
            >
              <span>{item.title}</span>
              {item.closable && tabsList.length > 1 && (
                <span
                  className={clsx(
                    'tabs-item-close text-10px text-icon rd-full flex-center h-16px w-16px transition-all hover:text-content -mr-4px hover:bg-active',
                    item.path === path && 'tabs-item-close-active'
                  )}
                  onClick={event => closeTab(event, item.path)}
                >
                  <SvgIcon icon='ri:close-large-fill' />
                </span>
              )}
            </div>
          </TabContextMenu>
        ))}
      </div>
      <TabContextMenu path={path} activePath={path} trigger={['click']} placement='bottomRight'>
        <div className='chip-btn shrink-0'>
          <SvgIcon className='text-24px text-icon' icon='ri:arrow-down-s-line' />
        </div>
      </TabContextMenu>
    </div>
  );
};

export default LayoutTabs;
