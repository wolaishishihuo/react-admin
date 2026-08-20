import { Button, Result } from 'antd';
import { useRouter } from '@tanstack/react-router';

interface RouteErrorProps {
  error: unknown;
  reset: () => void;
}

export default function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter();
  const message = error instanceof Error ? error.message : '无法获取用户信息或菜单权限数据，请检查网络后重试';

  return (
    <Result
      className='error-page'
      status='error'
      title='加载失败'
      subTitle={message}
      extra={
        <Button
          type='primary'
          onClick={() => {
            reset();
            void router.invalidate();
          }}
        >
          重试
        </Button>
      }
    />
  );
}
