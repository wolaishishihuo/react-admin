import { Breadcrumb } from 'antd';
import type { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { Link, useMatches } from 'react-router-dom';

import { HOME_URL } from '@/config';
import type { MetaProps, RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore } from '@/stores';
import { getAllBreadcrumbList } from '@/utils';

function renderTitle(item: RouteObjectType, isLink: boolean) {
  const title = item.meta?.title;
  return isLink ? <Link to={item.path!}>{title}</Link> : title;
}

function buildBreadcrumbItems(source: RouteObjectType[]): ItemType[] {
  const breadcrumbList = [...source];

  // You don’t need breadcrumbs on the home page, you can delete the following judgments
  if (breadcrumbList[0]?.path !== HOME_URL) {
    breadcrumbList.unshift({ path: HOME_URL, meta: { title: '首页' } });
  }

  // Processed into the format required by antd breadcrumbs
  return breadcrumbList.map((item, index) => {
    const isLast = index === breadcrumbList.length - 1;

    // The last breadcrumb is not clickable
    if (isLast) return { title: renderTitle(item, false) };

    // Render breadcrumb children
    if (item.children) {
      const items = item.children.filter(child => !child.meta?.isHide);
      return items.length
        ? {
            dropdownProps: { arrow: true },
            title: <a>{renderTitle(item, false)}</a>,
            menu: {
              items: items.map(child => ({ title: renderTitle(child, true) }))
            }
          }
        : { title: renderTitle(item, true) };
    }

    // Other breadcrumb
    return { title: renderTitle(item, true) };
  });
}

const BreadcrumbNav = () => {
  const matches = useMatches();
  const authMenuList = useAuthStore(state => state.authMenuList);
  const breadcrumb = useGlobalStore(state => state.breadcrumb);

  if (!breadcrumb) return null;

  const meta = matches[matches.length - 1]?.data as MetaProps | undefined;
  const breadcrumbAllList = getAllBreadcrumbList(authMenuList);
  const items = meta?.key ? buildBreadcrumbItems(breadcrumbAllList[meta.key] ?? []) : [];

  return <Breadcrumb items={items} />;
};

export default BreadcrumbNav;
