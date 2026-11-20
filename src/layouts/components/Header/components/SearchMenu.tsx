import { useDebounce } from 'ahooks';
import { Empty, Input, type InputRef, Modal } from 'antd';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import type { RouteObjectType } from '@/routers/interface';
import { useAuthStore } from '@/stores';

const IS_MAC = typeof navigator !== 'undefined' && /mac/i.test(navigator.userAgent);

const SearchMenu = () => {
  const navigate = useNavigate();

  const flatMenuList = useAuthStore(state => state.flatMenuList);

  const inputRef = useRef<InputRef>(null);
  const menuListRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearchValue = useDebounce(searchValue, { wait: 300 });

  // 供 keydown 订阅使用，避免输入防抖前每次按键都重建数组并重绑事件监听
  const searchList = useMemo(() => {
    const keyword = debouncedSearchValue.toLowerCase();
    return keyword
      ? flatMenuList.filter(
          item =>
            (item.path!.toLowerCase().includes(keyword) || item.meta!.title!.toLowerCase().includes(keyword)) &&
            !item.meta?.isHide
        )
      : [];
  }, [debouncedSearchValue, flatMenuList]);

  const activePath = searchList.some(item => item.path === selectedPath) ? selectedPath : (searchList[0]?.path ?? '');

  function showModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchValue(event.target.value);
  }

  function selectMenuItem(menu?: RouteObjectType) {
    if (!menu) return;
    if (menu.meta?.isLink) window.open(menu.meta.isLink, '_blank');
    navigate(menu.path!);
    closeModal();
  }

  useEffect(() => {
    if (!isModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const { length } = searchList;
        if (length === 0) return;
        const direction = event.key === 'ArrowUp' ? -1 : 1;
        const index = searchList.findIndex(item => item.path === activePath);
        const newIndex = (index + direction + length) % length;
        setSelectedPath(searchList[newIndex].path!);
        if (menuListRef.current?.firstElementChild) {
          const menuItemHeight = menuListRef.current.firstElementChild.clientHeight + 12 || 0;
          menuListRef.current.scrollTop = newIndex * menuItemHeight;
        }
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const menu = searchList.find(item => item.path === activePath);
        if (!menu) return;
        if (menu.meta?.isLink) window.open(menu.meta.isLink, '_blank');
        navigate(menu.path!);
        setIsModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, searchList, activePath, navigate]);

  useEffect(() => {
    if (!isModalOpen) {
      setSearchValue('');
      setSelectedPath('');
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus({ cursor: 'start' }), 10);
    return () => window.clearTimeout(timer);
  }, [isModalOpen]);

  useEffect(() => {
    function onShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsModalOpen(true);
      }
    }

    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  return (
    <>
      <div
        className='text-13px text-content-pale px-10px border border-line-box rounded-[8px] border-solid flex gap-8px h-36px w-160px cursor-pointer transition-colors items-center box-border hover:border-primary max-md:hidden'
        onClick={showModal}
      >
        <Icon className='text-16px text-icon' icon='ri:search-line' />
        <span className='flex-1'>搜索</span>
        <span className='text-12px text-icon leading-[18px] px-6px border border-line-box rounded-[4px] border-solid inline-flex h-20px items-center'>
          {IS_MAC ? '⌘ K' : 'Ctrl K'}
        </span>
      </div>
      <Modal className='search-modal' width={600} footer={null} closable={false} open={isModalOpen} onCancel={closeModal}>
        <Input
          ref={inputRef}
          placeholder='菜单搜索：支持菜单名称、路径'
          size='large'
          prefix={<Icon className='text-18px' icon='ri:search-line' />}
          allowClear={true}
          value={searchValue}
          onChange={handleInputChange}
        />
        {searchList.length ? (
          <div className='menu-list' ref={menuListRef}>
            {searchList.map(item => (
              <div
                key={item.path}
                className={`menu-item${item.path === activePath ? ' menu-active' : ''}`}
                onMouseEnter={() => setSelectedPath(item.path!)}
                onClick={() => selectMenuItem(item)}
              >
                <Icon className='menu-icon' icon={item.meta!.icon!} />
                <span className='menu-title'>{item.meta?.title}</span>
                <Icon className='menu-enter' icon='ri:corner-down-left-line' />
              </div>
            ))}
          </div>
        ) : (
          <Empty className='mb-30px mt-40px' description='暂无菜单' />
        )}
      </Modal>
    </>
  );
};

export default SearchMenu;
