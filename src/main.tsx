import '@/assets/icons/register';
import { QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { queryClient } from '@/services/query/client';
import App from './App.tsx';
import 'antd/dist/reset.css';
import 'virtual:uno.css';
import '@/styles/index.less';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
  // </React.StrictMode>
);
