import React from 'react';

import { useGlobalStore } from '@/stores';

const Maximize: React.FC = () => {
  const maximize = useGlobalStore(state => state.maximize);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  return (
    <React.Fragment>
      {maximize && (
        <div className='maximize-icon' onClick={() => setGlobalState('maximize', false)}>
          <i className='iconfont icon-tuichu'></i>;
        </div>
      )}
    </React.Fragment>
  );
};

export default Maximize;
