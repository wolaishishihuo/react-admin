import './index.less';

import AvatarIcon from './components/AvatarIcon';
import DarkModeToggle from './components/DarkModeToggle';
import Fullscreen from './components/Fullscreen';
import SearchMenu from './components/SearchMenu';
import ThemeSetting from './components/ThemeSetting';

const ToolBarRight = () => {
  return (
    <div className='tool-bar-ri'>
      <SearchMenu />
      <Fullscreen />
      <ThemeSetting />
      <DarkModeToggle />
      <AvatarIcon />
    </div>
  );
};

export default ToolBarRight;
