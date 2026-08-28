import { Icon as SvgIcon } from '@iconify/react/offline';
import { useCreation } from 'ahooks';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Descriptions, Empty, Skeleton, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { setTabTitle } from '@/stores';
import { getTabId } from '@/utils';
import { fetchUserDetail } from '../service';

const GENDER_TEXT = ['男', '女', '保密'];
const LIST_URL = '/list/useProTable';

/** 缓存详情：身份用 path param，ahooks useCreation 钉死首屏 */
const UserDetail = () => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = useCreation(() => routeId ?? '', []);
  const tabPath = useCreation(() => getTabId(), []);

  const { data, dataUpdatedAt, isFetching, refetch } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => fetchUserDetail(id),
    enabled: Boolean(id)
  });

  useEffect(() => {
    if (data) setTabTitle(`详情 - ${data.username}`, tabPath);
  }, [data, tabPath]);

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
          onClick={() => navigate(LIST_URL)}
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
        title='缓存详情'
        description='从列表打开多个用户详情后切标签：每份详情用自己的 id 请求，互不串数据。'
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
};

export default UserDetail;
