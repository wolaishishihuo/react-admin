import { Icon as SvgIcon } from '@iconify/react/offline';
import React from 'react';

import { useGlobalStore } from '@/stores';

const Maximize: React.FC = () => {
  const maximize = useGlobalStore(state => state.maximize);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  return (
    <React.Fragment>
      {maximize && (
        <div
          className='rd-full bg-floating-icon opacity-70 h-55px w-55px cursor-pointer fixed z-999 hover:bg-floating-icon-hover -right-25px -top-25px'
          onClick={() => setGlobalState('maximize', false)}
        >
          <SvgIcon className='text-14px text-white left-[19%] top-[48%] relative' icon='ri:fullscreen-exit-line' />
        </div>
      )}
    </React.Fragment>
  );
};

export default Maximize;
