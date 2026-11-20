import './index.css';
import BreadcrumbNav from './components/BreadcrumbNav';
import CollapseIcon from './components/CollapseIcon';

const ToolBarLeft = () => {
  return (
    <div className='tool-bar-lf mask-image'>
      <CollapseIcon />
      <BreadcrumbNav />
    </div>
  );
};

export default ToolBarLeft;
