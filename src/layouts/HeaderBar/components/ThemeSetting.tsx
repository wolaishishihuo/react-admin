import { patchAdminLayout } from '@/stores/modules/admin-layout.store';
import IconButton from './IconButton';

export default function ThemeSetting() {
  return (
    <IconButton icon='ri:settings-line' className='setting-btn' onClick={() => patchAdminLayout({ themeDrawerVisible: true })} />
  );
}
