import { useGlobalStore } from '@/stores';

import IconButton from './IconButton';

const ThemeSetting = () => {
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  function setThemeDrawerVisible() {
    setGlobalState('themeDrawerVisible', true);
  }

  return <IconButton icon='ri:settings-line' className='setting-btn' onClick={setThemeDrawerVisible} />;
};

export default ThemeSetting;
