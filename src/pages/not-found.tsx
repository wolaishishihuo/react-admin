import { Button, Result } from 'antd';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { HOME_PATH } from '@/features/navigation/menu-normalize';
import '@/pages/(errors)/index.less';

export default function RouteNotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/home/index') {
    void navigate({ to: HOME_PATH, replace: true });
    return null;
  }

  return (
    <Result
      className='error-page'
      status='404'
      title='404'
      subTitle='Sorry, the page you visited does not exist.'
      extra={
        <Button type='primary' onClick={() => navigate({ to: HOME_PATH })}>
          返回首页
        </Button>
      }
    />
  );
}
