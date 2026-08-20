import { setThemeMode, selectIsDark, useThemeStore } from '@/stores/modules/theme.store';
import { themeTransition } from '@/features/theme/theme-transition';
import IconButton from './IconButton';

export default function DarkModeToggle() {
  const isDark = useThemeStore(selectIsDark);
  return (
    <IconButton
      icon={isDark ? 'ri:sun-fill' : 'ri:moon-line'}
      onClick={() => themeTransition(() => setThemeMode(isDark ? 'light' : 'dark'))}
    />
  );
}
