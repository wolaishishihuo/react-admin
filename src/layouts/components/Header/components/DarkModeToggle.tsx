import { useGlobalStore } from '@/stores';

import IconButton from './IconButton';

const DarkModeToggle = () => {
  const isDark = useGlobalStore(state => state.isDark);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  return <IconButton icon={isDark ? 'ri:sun-fill' : 'ri:moon-line'} onClick={() => setGlobalState('isDark', !isDark)} />;
};

export default DarkModeToggle;
