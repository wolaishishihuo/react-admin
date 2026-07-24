import { HappyProvider } from '@ant-design/happy-work-theme';
import { theme, ConfigProvider, App as AppProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import type React from 'react';
import { useShallow } from 'zustand/react/shallow';
import RouterProvider from '@/routers';
import { useGlobalStore } from '@/stores';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

const App: React.FC = () => {
  const { isDark, primary, isHappy, compactAlgorithm, borderRadius } = useGlobalStore(
    useShallow(state => ({
      isDark: state.isDark,
      primary: state.primary,
      isHappy: state.isHappy,
      compactAlgorithm: state.compactAlgorithm,
      borderRadius: state.borderRadius
    }))
  );

  const algorithm = () => {
    const algorithmArr = isDark ? [theme.darkAlgorithm] : [theme.defaultAlgorithm];
    if (compactAlgorithm) algorithmArr.push(theme.compactAlgorithm);
    return algorithmArr;
  };

  return (
    <ConfigProvider
      locale={zhCN}
      button={{ autoInsertSpace: true }}
      theme={{
        token: {
          colorPrimary: primary,
          borderRadius,
          ...(isDark ? { colorBgContainer: '#161618', colorBgElevated: '#1e1e20' } : {})
        },
        components: {
          // 侧栏菜单芯片化样式
          Menu: {
            itemHeight: 42,
            itemBorderRadius: 6,
            itemMarginInline: 8,
            itemMarginBlock: 4,
            iconSize: 20,
            iconMarginInlineEnd: 8,
            collapsedIconSize: 20,
            activeBarBorderWidth: 0,
            subMenuItemBg: 'transparent',
            itemHoverBg: isDark ? '#17171c' : '#f2f4f5'
          }
        },
        algorithm: algorithm()
      }}
    >
      <HappyProvider disabled={!isHappy}>
        <AppProvider>
          <RouterProvider />
        </AppProvider>
      </HappyProvider>
    </ConfigProvider>
  );
};

export default App;
