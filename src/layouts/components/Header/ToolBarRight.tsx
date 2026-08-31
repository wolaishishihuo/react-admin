import './index.less';

import AvatarIcon from './components/AvatarIcon';
import Fullscreen from './components/Fullscreen';
import SearchMenu from './components/SearchMenu';
import ThemeSetting from './components/ThemeSetting';
import UserName from './components/UserName';

const ToolBarRight = () => {
  return (
    <div className='tool-bar-ri'>
      <div className='header-icon'>
        <SearchMenu />
        <ThemeSetting />
        <Fullscreen />
      </div>
      <UserName />
      <AvatarIcon />
    </div>
  );
};

export default ToolBarRight;
