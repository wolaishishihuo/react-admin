import { Icon as SvgIcon } from '@iconify/react/offline';
import { patchAdminLayout, useAdminLayoutStore } from '@/stores/modules/admin-layout.store';

export default function Maximize() {
  const maximize = useAdminLayoutStore(state => state.maximize);

  if (!maximize) return null;

  return (
    <div
      className='rd-full bg-floating-icon opacity-70 h-55px w-55px cursor-pointer fixed z-999 hover:bg-floating-icon-hover -right-25px -top-25px'
      onClick={() => patchAdminLayout({ maximize: false })}
    >
      <SvgIcon className='text-14px text-white left-[19%] top-[48%] relative' icon='ri:fullscreen-exit-line' />
    </div>
  );
}
