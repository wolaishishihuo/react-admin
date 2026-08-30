import 'antd/dist/reset.css';
import '@/styles/index.less';
import '@/assets/fonts/font.less';
import '@/assets/iconfont/iconfont.less';
import 'virtual:uno.css';
import 'virtual:svg-icons-register';

import ReactDOM from 'react-dom/client';

import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
