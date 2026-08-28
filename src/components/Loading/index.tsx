import './index.less';

import { Spin } from 'antd';

export const Loading = () => {
  return (
    <div className='loading-box'>
      <Spin size='large' />
    </div>
  );
};

export const PageLoader = () => <Loading />;
