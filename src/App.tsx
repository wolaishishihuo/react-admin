import { HappyProvider } from '@ant-design/happy-work-theme';
import { theme, ConfigProvider, App as AppProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import { useShallow } from 'zustand/react/shallow';
import AntdBridge from '@/app/AntdBridge';
import ThemeEffects from '@/features/theme/ThemeEffects';
import RouterProvider from '@/router/RouterProvider';
import { selectIsDark, useThemeStore } from '@/stores/modules/theme.store';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export default function App() {
  const { isDark, primary, isHappy, compactAlgorithm, borderRadius } = useThemeStore(
    useShallow(state => ({
      isDark: selectIsDark(state),
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
          <AntdBridge />
          <ThemeEffects />
          <RouterProvider />
        </AppProvider>
      </HappyProvider>
    </ConfigProvider>
  );
}
