import { Breadcrumb } from 'antd';
import type { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Icon } from '@/components/Icon';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import { useAuthorizedNavigation } from '@/features/navigation/menu-model';
import { getAllBreadcrumbList, findMenuByPath } from '@/features/navigation/menu-tree';
import type { NavigationItem } from '@/features/navigation/types';
import { getMenuSelectPath, useRoute } from '@/router/use-route';
import { useAdminLayoutStore } from '@/stores/modules/admin-layout.store';

export default function BreadcrumbNav() {
  const route = useRoute();
  const { tree } = useAuthorizedNavigation();
  const breadcrumb = useAdminLayoutStore(state => state.breadcrumb);
  const breadcrumbIcon = useAdminLayoutStore(state => state.breadcrumbIcon);
  const breadcrumbAllList = useMemo(() => getAllBreadcrumbList(tree), [tree]);
  const selectedPath = getMenuSelectPath(route);

  const items = useMemo<ItemType[]>(() => {
    const matched = findMenuByPath(tree, selectedPath);
    let breadcrumbList = (matched && breadcrumbAllList[matched.id]) || breadcrumbAllList[selectedPath] || [];

    if (breadcrumbList[0]?.path !== HOME_PATH) {
      breadcrumbList = [
        {
          id: HOME_PATH,
          path: HOME_PATH,
          icon: 'HomeOutlined',
          title: '首页',
          hidden: false,
          fixed: true,
          permissions: [],
          children: []
        },
        ...breadcrumbList
      ];
    }

    const renderTitle = (item: NavigationItem, isLink: boolean) => {
      const { icon, title } = item;
      const content = (
        <>
          {breadcrumbIcon && icon && (
            <span className='mr-5px'>
              <Icon name={icon} />
            </span>
          )}
          <span>{title}</span>
        </>
      );
      return isLink ? <Link to={item.path as '/'}>{content}</Link> : content;
    };

    return breadcrumbList.map(item => {
      const isLast = breadcrumbList[breadcrumbList.length - 1] === item;
      if (isLast) return { title: renderTitle(item, false) };
      if (item.children.length) {
        const children = item.children.filter(child => !child.hidden);
        return children.length
          ? {
              dropdownProps: { arrow: true },
              title: <a>{renderTitle(item, false)}</a>,
              menu: {
                items: children.map(child => ({ title: renderTitle(child, true) }))
              }
            }
          : { title: renderTitle(item, true) };
      }
      return { title: renderTitle(item, true) };
    });
  }, [selectedPath, breadcrumbIcon, breadcrumbAllList, tree]);

  if (!breadcrumb) return null;
  return <Breadcrumb items={items} />;
}
