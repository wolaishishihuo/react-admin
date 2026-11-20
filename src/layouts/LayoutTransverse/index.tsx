import './index.css';
import logo from '@/assets/images/logo.png';
import ToolBarRight from '@/layouts/components/Header/ToolBarRight';
import LayoutMain from '@/layouts/components/Main';
import LayoutMenu from '@/layouts/components/Menu';

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutTransverse = () => {
  return (
    <section className='layout-transverse'>
      <LayoutMain
        header={
          <>
            <div className='logo'>
              <img src={logo} alt='logo' className='logo-img' />
              <h2 className='logo-text'>{APP_TITLE}</h2>
            </div>
            <LayoutMenu mode='horizontal' />
            <ToolBarRight />
          </>
        }
      />
    </section>
  );
};

export default LayoutTransverse;
