import { useGlobalStore } from '@/stores';

import IconButton from './IconButton';

const ThemeSetting: React.FC = () => {
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  const setThemeDrawerVisible = () => {
    setGlobalState('themeDrawerVisible', true);
  };

  return <IconButton icon='ri:settings-line' className='setting-btn' onClick={setThemeDrawerVisible} />;
};
export default ThemeSetting;
