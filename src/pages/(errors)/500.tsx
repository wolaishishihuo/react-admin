import { createFileRoute } from '@tanstack/react-router';
import { Button, Result } from 'antd';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import { navigateTo } from '@/router/router-ref';
import './index.less';

export const Route = createFileRoute('/(errors)/500')({
  component: ServerErrorPage,
  staticData: { title: '500' }
});

function ServerErrorPage() {
  return (
    <Result
      className='error-page'
      status='500'
      title='500'
      subTitle='Sorry, something went wrong.'
      extra={
        <Button type='primary' onClick={() => navigateTo(HOME_PATH)}>
          返回首页
        </Button>
      }
    />
  );
}
