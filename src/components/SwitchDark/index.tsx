import { Icon as SvgIcon } from '@iconify/react/offline';
import { Button } from 'antd';

import { useGlobalStore } from '@/stores';

const SwitchDark: React.FC = () => {
  const isDark = useGlobalStore(state => state.isDark);
  const setThemeMode = useGlobalStore(state => state.setThemeMode);

  return (
    <Button
      type='text'
      size='large'
      className='switch-dark'
      icon={<SvgIcon className='text-22px' icon={isDark ? 'ri:sun-fill' : 'ri:moon-line'} />}
      onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
    ></Button>
  );
};

export default SwitchDark;
