import 'dayjs/locale/zh-cn';

import { HappyProvider } from '@ant-design/happy-work-theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { App as AppProvider, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import React from 'react';

import { queryClient } from '@/apis/query';
import { RefreshProvider } from '@/context/Refresh';
import RouterProvider from '@/routers';
import { useGlobalStore } from '@/stores';

dayjs.locale('zh-cn');

const App: React.FC = () => {
  const { isDark, primary, isHappy, componentSize, compactAlgorithm, borderRadius } = useGlobalStore(state => ({
    isDark: state.isDark,
    primary: state.primary,
    isHappy: state.isHappy,
    componentSize: state.componentSize,
    compactAlgorithm: state.compactAlgorithm,
    borderRadius: state.borderRadius
  }));

  const algorithm = () => {
    const algorithmArr = isDark ? [theme.darkAlgorithm] : [theme.defaultAlgorithm];
    if (compactAlgorithm) algorithmArr.push(theme.compactAlgorithm);
    return algorithmArr;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        componentSize={componentSize}
        button={{ autoInsertSpace: true }}
        theme={{
          token: { colorPrimary: primary, borderRadius },
          algorithm: algorithm()
        }}
      >
        <HappyProvider disabled={!isHappy}>
          <AppProvider>
            <RefreshProvider>
              <RouterProvider />
            </RefreshProvider>
          </AppProvider>
        </HappyProvider>
      </ConfigProvider>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition='bottom-left' />}
    </QueryClientProvider>
  );
};

export default App;
