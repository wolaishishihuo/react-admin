import { Button } from 'antd';

import { Icon } from '@/components/Icon';
import { useGlobalStore } from '@/stores';

const SwitchDark = () => {
  const isDark = useGlobalStore(state => state.isDark);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  return (
    <Button
      type='text'
      size='large'
      className='switch-dark'
      icon={<Icon className='text-22px' icon={isDark ? 'ri:sun-fill' : 'ri:moon-line'} />}
      onClick={() => setGlobalState('isDark', !isDark)}
    ></Button>
  );
};

export default SwitchDark;
