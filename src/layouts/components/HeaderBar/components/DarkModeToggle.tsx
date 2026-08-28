import { useGlobalStore } from '@/stores';
import { themeTransition } from '@/utils/themeAnimation';

import IconButton from './IconButton';

const DarkModeToggle: React.FC = () => {
  const isDark = useGlobalStore(state => state.isDark);
  const setThemeMode = useGlobalStore(state => state.setThemeMode);

  return (
    <IconButton
      icon={isDark ? 'ri:sun-fill' : 'ri:moon-line'}
      // auto 档点击时切换为显式 light/dark
      onClick={() => themeTransition(() => setThemeMode(isDark ? 'light' : 'dark'))}
    />
  );
};

export default DarkModeToggle;
