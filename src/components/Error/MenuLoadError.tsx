import { Button, Result } from 'antd';
import './index.less';

/** 权限初始化失败兜底视图（用户信息/菜单请求失败，回调重试，路由未挂载） */
const MenuLoadError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Result
      className='error-page'
      status='error'
      title='加载失败'
      subTitle='无法获取用户信息或菜单权限数据，请检查网络后重试'
      extra={
        <Button type='primary' onClick={onRetry}>
          重试
        </Button>
      }
    />
  );
};

export default MenuLoadError;
