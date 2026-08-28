import "./index.less";

import AvatarIcon from "./components/AvatarIcon";
import ComponentSize from "./components/ComponentSize";
import Fullscreen from "./components/Fullscreen";
import Language from "./components/Language";
import Message from "./components/Message";
import SearchMenu from "./components/SearchMenu";
import ThemeSetting from "./components/ThemeSetting";
import UserName from "./components/UserName";

const ToolBarRight: React.FC = () => {
  return (
    <div className="tool-bar-ri">
      <div className="header-icon">
        <ComponentSize />
        <Language />
        <SearchMenu />
        <ThemeSetting />
        <Message />
        <Fullscreen />
      </div>
      <UserName />
      <AvatarIcon />
    </div>
  );
};

export default ToolBarRight;
