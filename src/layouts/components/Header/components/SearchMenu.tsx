import { useDebounce } from 'ahooks';
import { Empty, Input, InputRef, Modal } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { RouteObjectType } from '@/routers/interface';
import { useAuthStore } from '@/stores';

const SearchMenu: React.FC = () => {
  const navigate = useNavigate();

  const flatMenuList = useAuthStore(state => state.flatMenuList);

  const inputRef = useRef<InputRef>(null);
  const menuListRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearchValue = useDebounce(searchValue, { wait: 300 });

  const isMac = /mac/i.test(navigator.userAgent);

  const showModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const searchList = useMemo(() => {
    return debouncedSearchValue
      ? flatMenuList.filter(
          item =>
            (item.path!.toLowerCase().includes(debouncedSearchValue.toLowerCase()) ||
              item.meta!.title!.toLowerCase().includes(debouncedSearchValue.toLowerCase())) &&
            !item.meta?.isHide
        )
      : [];
  }, [debouncedSearchValue]);

  useEffect(() => {
    searchList.length ? setActivePath(searchList[0].path!) : setActivePath('');
  }, [searchList]);

  const mouseoverMenuItem = (item: RouteObjectType) => {
    setActivePath(item.path!);
  };

  const keyPressUpOrDown = (direction: number) => {
    const { length } = searchList;
    if (length === 0) return;
    const index = searchList.findIndex(item => item.path === activePath);
    const newIndex = (index + direction + length) % length;
    setActivePath(searchList[newIndex].path!);
    if (menuListRef.current?.firstElementChild) {
      const menuItemHeight = menuListRef.current.firstElementChild.clientHeight + 12 || 0;
      menuListRef.current.scrollTop = newIndex * menuItemHeight;
    }
  };

  const selectMenuItem = () => {
    const menu = searchList.find(item => item.path === activePath);
    if (!menu) return;
    if (menu.meta?.isLink) window.open(menu.meta.isLink, '_blank');
    navigate(menu.path!);
    closeModal();
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
      selectMenuItem();
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
      <div
        className='text-13px text-content-pale px-10px border border-line-box rounded-[8px] border-solid flex gap-8px h-36px w-160px cursor-pointer transition-colors items-center box-border hover:border-primary max-md:hidden'
        onClick={showModal}
      >
        <Icon className='text-16px text-icon' icon='ri:search-line' />
        <span className='flex-1'>搜索</span>
        <span className='text-12px text-icon leading-[18px] px-6px border border-line-box rounded-[4px] border-solid inline-flex h-20px items-center'>
          {isMac ? '⌘ K' : 'Ctrl K'}
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
                className={`menu-item ${item.path === activePath && 'menu-active'}`}
                onMouseEnter={() => mouseoverMenuItem(item)}
                onClick={() => selectMenuItem()}
              >
                <Icon className='menu-icon' icon={item.meta!.icon!} />
                <span className='menu-title'>{item.meta?.title}</span>
                <Icon className='menu-enter' icon='ri:corner-down-left-line' />
              </div>
            ))}
          </div>
        ) : (
          <Empty className='mb30 mt40' description='暂无菜单' />
        )}
      </Modal>
    </React.Fragment>
  );
};
export default SearchMenu;
