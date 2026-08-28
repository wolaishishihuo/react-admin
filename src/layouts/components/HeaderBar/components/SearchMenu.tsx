import { Icon as SvgIcon } from '@iconify/react/offline';
import { useDebounce } from 'ahooks';
import { Empty, Input, type InputRef, Modal } from 'antd';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { type RouteObjectType } from '@/routers/interface';
import { useAuthStore, useUserStore } from '@/stores';

const isMac = /macintosh|mac os x/i.test(navigator.userAgent);

const SearchMenu: React.FC = () => {
  const navigate = useNavigate();

  const flatMenuList = useAuthStore(state => state.flatMenuList);
  const searchHistory = useUserStore(state => state.searchHistory);
  const addSearchHistory = useUserStore(state => state.addSearchHistory);
  const removeSearchHistory = useUserStore(state => state.removeSearchHistory);

  const inputRef = useRef<InputRef>(null);
  const menuListRef = useRef<HTMLDivElement>(null);
  // 键盘导航后短暂屏蔽 hover，防鼠标抢走焦点
  const keyboardNavRef = useRef(false);
  const keyboardNavTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearchValue = useDebounce(searchValue, { wait: 300 });

  const showModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  // 只搜叶子菜单（排除仍带 children 的目录节点）
  const searchList = useMemo(() => {
    return debouncedSearchValue
      ? flatMenuList.filter(
          item =>
            (item.path!.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
              item.meta!.title!.toLowerCase().includes(debouncedSearchValue.toLowerCase())) &&
            !item.meta?.isHide &&
            !item.children?.length
        )
      : [];
  }, [debouncedSearchValue, flatMenuList]);

  // 搜索历史：path 反查菜单，失效项静默过滤
  const historyList = useMemo(() => {
    return searchHistory
      .map(path => flatMenuList.find(item => item.path === path))
      .filter((item): item is RouteObjectType => !!item);
  }, [searchHistory, flatMenuList]);

  const isHistoryMode = !debouncedSearchValue;
  const displayList = isHistoryMode ? historyList : searchList;

  useEffect(() => {
    displayList.length ? setActivePath(displayList[0].path!) : setActivePath('');
  }, [displayList]);

  const markKeyboardNav = () => {
    keyboardNavRef.current = true;
    clearTimeout(keyboardNavTimer.current);
    keyboardNavTimer.current = setTimeout(() => (keyboardNavRef.current = false), 100);
  };

  useEffect(() => () => clearTimeout(keyboardNavTimer.current), []);

  const mouseoverMenuItem = (item: RouteObjectType) => {
    if (keyboardNavRef.current) return;
    setActivePath(item.path!);
  };

  const keyPressUpOrDown = (direction: number) => {
    const { length } = displayList;
    if (length === 0) return;
    markKeyboardNav();
    const index = displayList.findIndex(item => item.path === activePath);
    const newIndex = (index + direction + length) % length;
    setActivePath(displayList[newIndex].path!);
    if (menuListRef.current?.firstElementChild) {
      const menuItemHeight = menuListRef.current.firstElementChild.clientHeight + 12 || 0;
      menuListRef.current.scrollTop = newIndex * menuItemHeight;
    }
  };

  const selectMenuItem = (menu: RouteObjectType) => {
    addSearchHistory(menu.path!);
    if (menu.meta?.isLink) window.open(menu.meta.isLink, '_blank');
    navigate(menu.path!);
    closeModal();
  };

  const selectActiveMenuItem = () => {
    const menu = displayList.find(item => item.path === activePath);
    if (!menu) return;
    selectMenuItem(menu);
  };

  const handleDeleteHistory = (event: React.MouseEvent, item: RouteObjectType) => {
    event.stopPropagation();
    removeSearchHistory(item.path!);
  };

  const keyboardOperation = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      keyPressUpOrDown(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      keyPressUpOrDown(1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      selectActiveMenuItem();
    }
  };

  useEffect(() => {
    const handler = isModalOpen ? window.addEventListener : window.removeEventListener;
    handler('keydown', keyboardOperation);
    return () => window.removeEventListener('keydown', keyboardOperation);
  }, [isModalOpen, keyboardOperation]);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus({ cursor: 'start' }), 10);
    } else {
      setSearchValue('');
    }
  }, [isModalOpen]);

  // Cmd/Ctrl+K 唤起搜索
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  return (
    <React.Fragment>
      {/* 搜索触发器为独立样式（36px 高 / line-box 边框 / 固定 8px 圆角），非 chip 家族，勿并入 chip 基底 */}
      <div
        className='text-13px text-content-pale px-10px border border-line-box rd-8px flex gap-8px h-36px w-160px cursor-pointer transition-colors items-center box-border hover:border-primary lt-md:!hidden'
        onClick={showModal}
      >
        <SvgIcon className='text-16px text-icon' icon='ri:search-line' />
        <span className='flex-1'>搜索</span>
        <span className='text-12px text-icon leading-18px px-6px border border-line-box rd-4px h-20px'>
          {isMac ? '⌘ K' : 'Ctrl K'}
        </span>
      </div>
      <Modal className='search-modal' width={600} footer={null} closable={false} open={isModalOpen} onCancel={closeModal}>
        <Input
          ref={inputRef}
          placeholder='菜单搜索：支持菜单名称、路径'
          size='large'
          prefix={<SvgIcon icon='ri:search-line' className='text-18px' />}
          allowClear={true}
          value={searchValue}
          onChange={handleInputChange}
        />
        {isHistoryMode && displayList.length > 0 && <p className='text-12px text-content-pale mb-0 mt-15px'>搜索历史</p>}
        {displayList.length > 0 && (
          <div className={clsx('menu-list max-h-510px overflow-auto', isHistoryMode ? 'mt-5px' : 'mt-15px')} ref={menuListRef}>
            {displayList.map(item => (
              <div
                key={item.path}
                className={clsx(
                  'menu-item text-content-secondary my-10px px-20px border border-line rd-base bg-transparent flex h-46px cursor-pointer transition-all duration-200 ease-in-out items-center relative',
                  item.path === activePath && 'menu-active'
                )}
                onMouseEnter={() => mouseoverMenuItem(item)}
                onClick={() => selectMenuItem(item)}
              >
                <Icon
                  className={clsx('menu-icon text-16px mr-8px', item.path === activePath && 'text-18px')}
                  name={item.meta!.icon!}
                />
                <span className={clsx('menu-title text-14px', item.path === activePath && 'text-16px')}>{item.meta?.title}</span>
                {isHistoryMode ? (
                  <span
                    className='menu-enter text-16px flex cursor-pointer items-center right-20px absolute'
                    onClick={event => handleDeleteHistory(event, item)}
                  >
                    <SvgIcon icon='ri:close-line' />
                  </span>
                ) : (
                  <SvgIcon
                    icon='ri:corner-down-left-line'
                    className={clsx('menu-enter text-16px right-20px absolute', item.path === activePath && 'text-20px')}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {!isHistoryMode && displayList.length === 0 && <Empty className='mb-30px mt-40px' description='暂无菜单' />}
        <div className='text-12px text-content-pale mt-15px pt-12px border-t border-line flex gap-16px items-center'>
          <span className='flex gap-6px items-center'>
            <i className='keyboard'>
              <SvgIcon icon='ri:corner-down-left-line' />
            </i>
            选择
          </span>
          <span className='flex gap-6px items-center'>
            <i className='keyboard'>
              <SvgIcon icon='ri:arrow-up-wide-fill' />
            </i>
            <i className='keyboard'>
              <SvgIcon icon='ri:arrow-down-wide-fill' />
            </i>
            切换
          </span>
          <span className='flex gap-6px items-center'>
            <i className='keyboard keyboard-esc'>ESC</i>
            关闭
          </span>
        </div>
      </Modal>
    </React.Fragment>
  );
};
export default SearchMenu;
