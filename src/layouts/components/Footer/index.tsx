import './index.css';
import { Layout } from 'antd';

import { useGlobalStore } from '@/stores';

const { Footer } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutFooter = () => {
  const footer = useGlobalStore(state => state.footer);
  if (!footer) return null;

  return (
    <Footer className='ant-footer flex-center'>
      <a href='#' target='_blank' rel='noreferrer'>
        2026 © {APP_TITLE}
      </a>
    </Footer>
  );
};

export default LayoutFooter;
