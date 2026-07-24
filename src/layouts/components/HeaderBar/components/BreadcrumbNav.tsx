import { Breadcrumb } from 'antd';
import { type ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { HOME_URL } from '@/config';
import { type MetaProps, type RouteObjectType } from '@/routers/interface';
import { useAuthStore, useGlobalStore } from '@/stores';
import { getAllBreadcrumbList } from '@/utils';

const BreadcrumbNav: React.FC = () => {
  const matches = useMatches();

  const authMenuList = useAuthStore(state => state.authMenuList);
  const breadcrumb = useGlobalStore(state => state.breadcrumb);
  const breadcrumbIcon = useGlobalStore(state => state.breadcrumbIcon);
  const breadcrumbAllList = useMemo(() => getAllBreadcrumbList(authMenuList), [authMenuList]);

  const [curBreadcrumbList, setCurBreadcrumbList] = useState<ItemType[]>([]);

  const renderTitle = (item: RouteObjectType, isLink: boolean) => {
    const { icon, title } = item.meta || {};
    const content = (
      <React.Fragment>
        {breadcrumbIcon && icon && (
          <span className='mr-5px'>
            <Icon name={icon!} />
          </span>
        )}
        <span>{title}</span>
      </React.Fragment>
    );
    return isLink ? <Link to={item.path!}>{content}</Link> : content;
  };

  useEffect(() => {
    const meta = matches[matches.length - 1].loaderData as MetaProps;
    if (!meta?.key) return;

    let breadcrumbList = breadcrumbAllList[meta.key] || [];

    // 首页不在链首时补首页项
    if (breadcrumbList[0]?.path !== HOME_URL) {
      breadcrumbList.unshift({ path: HOME_URL, meta: { icon: 'HomeOutlined', title: '首页' } });
    }

    const antdBreadcrumbList = breadcrumbList.map(item => {
      const isLast = breadcrumbList.lastIndexOf(item) === breadcrumbList.length - 1;

      if (isLast) return { title: renderTitle(item, false) };

      if (item.children) {
        const items = item.children.filter(child => !child.meta?.isHide);
        return items.length
          ? {
              dropdownProps: { arrow: true },
              title: <a>{renderTitle(item, false)}</a>,
              menu: {
                items: items.map(child => {
                  return { title: renderTitle(child, true) };
                })
              }
            }
          : { title: renderTitle(item, true) };
      }

      return { title: renderTitle(item, true) };
    });

    setCurBreadcrumbList(antdBreadcrumbList);
  }, [matches, breadcrumbIcon]);

  return <React.Fragment>{breadcrumb && <Breadcrumb items={curBreadcrumbList}></Breadcrumb>}</React.Fragment>;
};

export default BreadcrumbNav;
