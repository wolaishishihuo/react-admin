import { Icon as SvgIcon } from '@iconify/react/offline';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Descriptions, Empty, Skeleton, Tag } from 'antd';
import dayjs from 'dayjs';
import { useEffectOnActive, useKeepAliveContext } from 'keepalive-for-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { setTabTitle } from '@/stores';
import { fetchUserDetail } from '../service';

const GENDER_TEXT = ['男', '女', '保密'];
const LIST_URL = '/list/useProTable';

/** 缓存页数据获取示例：隐藏期间不发请求、不写全局状态 */
const UserDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';

  // 页面被缓存隐藏时 active 为 false
  const { active } = useKeepAliveContext();

  const { data, dataUpdatedAt, isFetching, refetch } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => fetchUserDetail(id),
    // 活跃门：隐藏页仍会响应依赖变化，且从全局 location 读到的是别人的 id
    enabled: active && Boolean(id)
  });

  // setTabTitle 按当前 URL 匹配标签，隐藏期间执行会改到别人的标签上
  useEffectOnActive(() => {
    if (data) setTabTitle(`详情 - ${data.username}`);
  }, [data]);

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
        title='缓存页活跃门示例'
        description='从列表页打开多个用户的详情后在标签间来回切换：隐藏的详情页不会重新请求，「数据更新于」保持不变。'
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
