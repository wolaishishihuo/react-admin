import { Menu, type MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Icon } from '@/components/Icon';
import type { NavigationItem } from '@/features/navigation/types';
import useIsMobile from '@/hooks/useIsMobile';
import { useAuthorizedNavigation } from '@/features/navigation/menu-model';
import { getParentPaths } from '@/features/navigation/menu-tree';
import { getMenuSelectPath, useRoute } from '@/router/use-route';
import { navigateTo } from '@/router/router-ref';
import { patchAdminLayout, useAdminLayoutStore } from '@/stores/modules/admin-layout.store';
import { isHttpUrl, openExternal } from '@/utils/url';
import './index.less';

interface LayoutMenuProps {
  mode: MenuProps['mode'];
  menuList?: NavigationItem[];
  popupClassName?: string;
}

export default function LayoutMenu({ mode, menuList, popupClassName }: LayoutMenuProps) {
  const route = useRoute();
  const isMobile = useIsMobile();
  const { menuType, accordion, isCollapse } = useAdminLayoutStore(
    useShallow(state => ({
      menuType: state.menuType,
      accordion: state.accordion,
      isCollapse: state.isCollapse
    }))
  );
  const { pathMap, tree, visibleTree } = useAuthorizedNavigation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(
    label: React.ReactNode,
    key?: React.Key | null,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group'
  ): MenuItem {
    return { key, icon, children, label, type } as MenuItem;
  }

  const handleMenuAsAntdFormat = (list: NavigationItem[]): MenuItem[] => {
    return list.map(item => {
      return !item.children.length
        ? getItem(item.title, item.path, <Icon name={item.icon!} />)
        : ({
            ...getItem(item.title, item.path, <Icon name={item.icon!} />, handleMenuAsAntdFormat(item.children)),
            popupClassName
          } as MenuItem);
    });
  };

  const antdMenuList = useMemo(() => handleMenuAsAntdFormat(menuList ?? visibleTree), [menuList, visibleTree, popupClassName]);

  const selectedPath = getMenuSelectPath(route);
  const selectedKeys = [selectedPath];

  useEffect(() => {
    if (accordion) setTimeout(() => isCollapse || setOpenKeys(getParentPaths(tree, selectedPath)));
  }, [selectedPath, isCollapse, accordion, tree]);

  const onOpenChange: MenuProps['onOpenChange'] = keys => {
    if (keys.length === 0 || keys.length === 1) return setOpenKeys(keys);
    const latestOpenKey = keys[keys.length - 1];
    if (latestOpenKey.includes(keys[0])) return setOpenKeys(keys);
    setOpenKeys([latestOpenKey]);
  };

  const handleMenuNavigation = (path: string) => {
    const menuItem = pathMap.get(path);
    if (menuItem?.external && isHttpUrl(menuItem.external)) {
      openExternal(menuItem.external);
      return;
    }
    void navigateTo(path);
    if (isMobile) patchAdminLayout({ isCollapse: true });
  };

  const isTopMenu = useMemo(() => menuType === 'top', [menuType]);

  return (
    <Menu
      theme='light'
      mode={mode}
      selectedKeys={selectedKeys}
      onClick={({ key }) => handleMenuNavigation(key)}
      items={antdMenuList}
      {...(mode === 'inline' && { inlineCollapsed: !isMobile && isCollapse })}
      {...(!isTopMenu && accordion && { openKeys, onOpenChange })}
    />
  );
}
