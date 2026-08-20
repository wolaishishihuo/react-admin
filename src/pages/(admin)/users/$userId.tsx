import { createFileRoute } from '@tanstack/react-router';
import { Descriptions } from 'antd';
import { useRoute } from '@/router/use-route';

export const Route = createFileRoute('/(admin)/users/$userId')({
  component: UserProfilePage,
  staticData: {
    title: '用户资料',
    keepAlive: true,
    tab: { multi: false },
    activeMenu: '/list/useProTable'
  }
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const route = useRoute();

  return (
    <div className='px-5px py-8px'>
      <div className='app-card p-24px'>
        <Descriptions
          bordered
          column={1}
          items={[
            { key: 'userId', label: '用户 ID', children: userId },
            { key: 'originPath', label: 'originPath', children: route.originPath },
            { key: 'pathname', label: 'pathname', children: route.pathname }
          ]}
        />
      </div>
    </div>
  );
}
