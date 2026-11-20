import './index.css';
import { Button, Result, Space } from 'antd';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';

import { HOME_URL } from '@/config';

function getErrorDetail(error: unknown) {
  if (isRouteErrorResponse(error)) return `${error.status} ${error.statusText}`;
  if (error instanceof Error) return error.message;
  return undefined;
}

const RouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const detail = import.meta.env.DEV ? getErrorDetail(error) : undefined;

  return (
    <Result
      className='error-page'
      status='500'
      title='页面加载失败'
      subTitle={detail || '页面资源加载异常或发生意外错误，请尝试刷新页面。'}
      extra={
        <Space>
          <Button type='primary' onClick={() => window.location.reload()}>
            刷新页面
          </Button>
          <Button onClick={() => navigate(HOME_URL, { replace: true })}>返回首页</Button>
        </Space>
      }
    />
  );
};

export default RouteError;
