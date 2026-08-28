import './index.less';

import { Spin } from 'antd';
import { useEffect } from 'react';

import NProgress from '@/config/nprogress';

export const Loading = () => {
  return (
    <div className='loading-box'>
      <Spin size='large' />
    </div>
  );
};

export const PageLoader = () => {
  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, []);

  return <Loading />;
};
