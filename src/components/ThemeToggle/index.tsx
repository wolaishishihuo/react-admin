import { Button } from 'antd';
import { Icon as SvgIcon } from '@iconify/react/offline';
import { setThemeMode, selectIsDark, useThemeStore } from '@/stores/modules/theme.store';
import { themeTransition } from '@/features/theme/theme-transition';

interface ThemeToggleProps {
  className?: string;
  withTransition?: boolean;
}

export default function ThemeToggle({ className, withTransition = true }: ThemeToggleProps) {
  const isDark = useThemeStore(selectIsDark);

  const toggle = () => {
    const apply = () => setThemeMode(isDark ? 'light' : 'dark');
    if (withTransition) themeTransition(apply);
    else apply();
  };

  return (
    <Button
      type='text'
      size='large'
      className={className}
      icon={<SvgIcon className='text-22px' icon={isDark ? 'ri:sun-fill' : 'ri:moon-line'} />}
      onClick={toggle}
    />
  );
}
