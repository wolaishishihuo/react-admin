import { useGlobalStore } from '@/stores';

import IconButton from './IconButton';

const CollapseIcon: React.FC = () => {
  const isCollapse = useGlobalStore(state => state.isCollapse);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  return <IconButton icon='ri:menu-2-fill' onClick={() => setGlobalState('isCollapse', !isCollapse)} />;
};

export default CollapseIcon;
