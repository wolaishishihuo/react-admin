import { Icon } from '@/components/Icon';
import { useGlobalStore } from '@/stores';

const Maximize = () => {
  const maximize = useGlobalStore(state => state.maximize);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  if (!maximize) return null;

  return (
    <div className='maximize-icon' onClick={() => setGlobalState('maximize', false)}>
      <Icon className='text-14px text-white left-[19%] top-[48%] relative' icon='ri:fullscreen-exit-line' />
    </div>
  );
};

export default Maximize;
