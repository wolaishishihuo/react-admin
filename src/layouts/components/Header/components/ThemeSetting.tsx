import { SettingOutlined } from '@ant-design/icons';

import { useGlobalStore } from '@/stores';

const ThemeSetting = () => {
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  function setThemeDrawerVisible() {
    setGlobalState('themeDrawerVisible', true);
  }

  return <SettingOutlined className='text-20px' onClick={setThemeDrawerVisible} />;
};

export default ThemeSetting;
