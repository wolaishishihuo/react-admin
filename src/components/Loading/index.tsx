import { Spin } from 'antd';
import './index.less';

export function Loading() {
  return (
    <div className='loading-box'>
      <Spin size='large' />
    </div>
  );
}
