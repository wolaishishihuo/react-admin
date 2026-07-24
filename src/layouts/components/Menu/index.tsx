import { Menu, type MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useMatches } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from '@/components/Icon';
import useIsMobile from '@/hooks/useIsMobile';
import { type RouteObjectType, type MetaProps } from '@/routers/interface';
import { setGlobalState, useGlobalStore, useAuthStore } from '@/stores';
import { getParentPaths } from '@/utils';
import './index.less';

interface LayoutMenuProps {
  mode: MenuProps['mode'];
  menuList?: RouteObjectType[];
  /** 弹出子菜单容器类名 */
  popupClassName?: string;
}

const LayoutMenu: React.FC<LayoutMenuProps> = ({ mode, menuList, popupClassName }) => {
  const matches = useMatches();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const { menuType, accordion, isCollapse } = useGlobalStore(
    useShallow(state => ({
      menuType: state.menuType,
      accordion: state.accordion,
      isCollapse: state.isCollapse
    }))
  );
  const { showMenuList, flatMenuList } = useAuthStore(
    useShallow(state => ({
      showMenuList: state.showMenuList,
      flatMenuList: state.flatMenuList
    }))
  );

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type
    } as MenuItem;
  }

  const handleMenuAsAntdFormat = (list: RouteObjectType[]): MenuItem[] => {
    return list.map(item => {
      return !item?.children?.length
        ? getItem(item.meta?.title, item.path, <Icon name={item.meta!.icon!} />)
        : ({
            ...getItem(item.meta?.title, item.path, <Icon name={item.meta!.icon!} />, handleMenuAsAntdFormat(item.children!)),
            popupClassName
          } as MenuItem);
    });
  };

  const antdMenuList = useMemo(() => handleMenuAsAntdFormat(menuList ?? showMenuList), [menuList, showMenuList, popupClassName]);

  useEffect(() => {
    const meta = matches[matches.length - 1].loaderData as MetaProps;
    const path = meta?.activeMenu ?? pathname;
    setSelectedKeys([path]);

    // setTimeout 防菜单展开样式异常；openKeys 取祖先 path 链
    if (accordion) setTimeout(() => isCollapse || setOpenKeys(getParentPaths(menuList ?? showMenuList, path)));
  }, [matches, isCollapse]);

  const onOpenChange: MenuProps['onOpenChange'] = openKeys => {
    if (openKeys.length === 0 || openKeys.length === 1) return setOpenKeys(openKeys);
    const latestOpenKey = openKeys[openKeys.length - 1];
    if (latestOpenKey.includes(openKeys[0])) return setOpenKeys(openKeys);
    setOpenKeys([latestOpenKey]);
  };

  const handleMenuNavigation = (path: string) => {
    const menuItem = flatMenuList.find(item => item.path === path);
    if (menuItem?.meta?.isLink) window.open(menuItem.meta.isLink, '_blank');
    navigate(path);
    // 移动端导航后收起侧栏
    if (isMobile) setGlobalState({ key: 'isCollapse', value: true });
  };

  const clickMenu: MenuProps['onClick'] = ({ key }) => handleMenuNavigation(key);

  const isTopMenu = useMemo(() => menuType === 'top', [menuType]);

  return (
    // theme 固定 light：暗色走 darkAlgorithm，不用 antd dark 菜单主题
    <Menu
      theme='light'
      mode={mode}
      selectedKeys={selectedKeys}
      onClick={clickMenu}
      items={antdMenuList}
      {...(mode === 'inline' && { inlineCollapsed: !isMobile && isCollapse })}
      {...(!isTopMenu && accordion && { openKeys, onOpenChange })}
    />
  );
};

export default LayoutMenu;
