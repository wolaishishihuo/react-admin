import { setGlobalState } from '@/stores';
import IconButton from './IconButton';

const ThemeSetting: React.FC = () => {
  const setThemeDrawerVisible = () => {
    setGlobalState({ key: 'themeDrawerVisible', value: true });
  };

  return <IconButton icon='ri:settings-line' className='setting-btn' onClick={setThemeDrawerVisible} />;
};
export default ThemeSetting;
