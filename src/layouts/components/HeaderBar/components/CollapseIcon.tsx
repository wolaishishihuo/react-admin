import { setGlobalState, useGlobalStore } from '@/stores';
import IconButton from './IconButton';

const CollapseIcon: React.FC = () => {
  const isCollapse = useGlobalStore(state => state.isCollapse);

  return <IconButton icon='ri:menu-2-fill' onClick={() => setGlobalState({ key: 'isCollapse', value: !isCollapse })} />;
};

export default CollapseIcon;
