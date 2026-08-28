import { Icon as SvgIcon } from '@iconify/react/offline';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Alert, Button, Descriptions, Empty, Skeleton, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { z } from 'zod';
import { Icon } from '@/components/Icon';
import { navigateTo } from '@/router/router-ref';
import { useRoute } from '@/router/use-route';
import { getTabId } from '@/stores/modules/tab-identity';
import { setTabTitle } from '@/stores/modules/tabs.store';
import { fetchUserDetail } from '../modules/api';

const detailSearchSchema = z.object({
  id: z.string().min(1)
});

export const Route = createFileRoute('/(admin)/list/useProTable/detail/')({
  validateSearch: detailSearchSchema,
  loaderDeps: ({ search }) => ({ id: search.id }),
  staticData: {
    title: '用户详情',
    keepAlive: true,
    menu: { icon: 'ri:file-list-3-line', hide: true, activeMenu: '/list/useProTable' },
    tab: { multi: true }
  },
  component: UserDetail
});

const GENDER_TEXT = ['男', '女', '保密'];
const LIST_URL = '/list/useProTable';

/** 缓存页数据获取示例：隐藏期间不发请求、不写全局状态 */
function UserDetail() {
  const route = useRoute();
  const { id } = Route.useSearch();

  const { data, dataUpdatedAt, isFetching, refetch } = useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: () => fetchUserDetail(id),
    enabled: Boolean(id)
  });

  useEffect(() => {
    if (!data) return;
    setTabTitle(getTabId(route.originPath, true, route.fullPath), `详情 - ${data.username}`);
  }, [data, route.originPath, route.fullPath]);

  const items = data && [
    { key: 'id', label: '用户 ID', children: data.id },
    { key: 'username', label: '用户名', children: data.username },
    { key: 'gender', label: '性别', children: GENDER_TEXT[data.gender] ?? '保密' },
    { key: 'mobile', label: '手机号', children: data.mobile },
    { key: 'icon', label: '图标', children: <Icon name={data.icon} className='text-18px' /> },
    {
      key: 'status',
      label: '状态',
      children: <Tag color={data.status === 1 ? 'success' : 'default'}>{data.status === 1 ? '启用' : '停用'}</Tag>
    },
    { key: 'createTime', label: '创建时间', children: data.createTime, span: 2 }
  ];

  return (
    <div className='px-5px py-8px flex flex-col gap-15px'>
      <div className='app-card p-24px flex flex-wrap gap-12px items-center justify-between'>
        <Button
          icon={<SvgIcon icon='ri:arrow-left-line' className='align--2px inline-block' />}
          onClick={() => navigateTo(LIST_URL)}
        >
          返回列表
        </Button>
        <span className='text-13px text-content-pale'>
          数据更新于 {dataUpdatedAt ? dayjs(dataUpdatedAt).format('HH:mm:ss') : '—'}
        </span>
        <Button
          icon={<SvgIcon icon='ri:refresh-line' className='align--2px inline-block' />}
          loading={isFetching}
          onClick={() => refetch()}
        >
          刷新
        </Button>
      </div>

      <Alert
        showIcon
        type='info'
        description='从列表页打开多个用户的详情后在标签间来回切换：各详情 Tab 读取自己的 id 与 Router 快照。'
      />

      <div className='app-card p-24px'>
        {isFetching && !data ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : items ? (
          <Descriptions bordered column={2} items={items} size='middle' />
        ) : (
          <Empty description={id ? '用户不存在' : '缺少用户 id'} />
        )}
      </div>
    </div>
  );
}
