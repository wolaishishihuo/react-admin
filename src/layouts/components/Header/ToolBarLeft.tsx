import './index.less';

import BreadcrumbNav from './components/BreadcrumbNav';
import CollapseIcon from './components/CollapseIcon';

const ToolBarLeft: React.FC = () => {
  return (
    <div className='tool-bar-lf mask-image'>
      <CollapseIcon />
      <BreadcrumbNav />
    </div>
  );
};

export default ToolBarLeft;
