import { patchAdminLayout, useAdminLayoutStore } from '@/stores/modules/admin-layout.store';
import IconButton from './IconButton';

export default function CollapseIcon() {
  const isCollapse = useAdminLayoutStore(state => state.isCollapse);
  return <IconButton icon='ri:menu-2-fill' onClick={() => patchAdminLayout({ isCollapse: !isCollapse })} />;
}
