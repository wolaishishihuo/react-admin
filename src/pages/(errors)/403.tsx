import { createFileRoute } from '@tanstack/react-router';
import { Button, Result } from 'antd';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import { navigateTo } from '@/router/router-ref';
import './index.less';

export const Route = createFileRoute('/(errors)/403')({
  component: ForbiddenPage,
  staticData: { title: '403' }
});

function ForbiddenPage() {
  return (
    <Result
      className='error-page'
      status='403'
      title='403'
      subTitle='Sorry, you are not authorized to access this page.'
      extra={
        <Button type='primary' onClick={() => navigateTo(HOME_PATH)}>
          返回首页
        </Button>
      }
    />
  );
}
