import "dayjs/locale/zh-cn";

import { HappyProvider } from "@ant-design/happy-work-theme";
import { App as AppProvider, ConfigProvider, theme } from "antd";
import enUS from "antd/locale/en_US";
import zhCN from "antd/locale/zh_CN";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

import { RefreshProvider } from "@/context/Refresh";
import i18n from "@/languages/index";
import RouterProvider from "@/routers";
import { useGlobalStore } from "@/stores";
import { LanguageType } from "@/stores/interface";
import { getBrowserLang } from "@/utils";

const App: React.FC = () => {
  const { isDark, primary, isHappy, componentSize, compactAlgorithm, borderRadius, language, setGlobalState } = useGlobalStore(
    state => ({
      isDark: state.isDark,
      primary: state.primary,
      isHappy: state.isHappy,
      componentSize: state.componentSize,
      compactAlgorithm: state.compactAlgorithm,
      borderRadius: state.borderRadius,
      language: state.language,
      setGlobalState: state.setGlobalState
    })
  );

  // init theme algorithm
  const algorithm = () => {
    const algorithmArr = isDark ? [theme.darkAlgorithm] : [theme.defaultAlgorithm];
    if (compactAlgorithm) algorithmArr.push(theme.compactAlgorithm);
    return algorithmArr;
  };

  // init language
  const initLanguage = () => {
    const result = language ?? getBrowserLang();
    setGlobalState("language", result as LanguageType);
    i18n.changeLanguage(language as string);
    dayjs.locale(language === "zh" ? "zh-cn" : "en");
  };

  useEffect(() => {
    initLanguage();
  }, [language]);

  return (
    <ConfigProvider
      locale={language === "zh" ? zhCN : enUS}
      componentSize={componentSize}
      button={{ autoInsertSpace: true }}
      theme={{
        token: { colorPrimary: primary, borderRadius },
        algorithm: algorithm()
      }}
    >
      <HappyProvider disabled={!isHappy}>
        <AppProvider>
          <I18nextProvider i18n={i18n}>
            <RefreshProvider>
              <RouterProvider />
            </RefreshProvider>
          </I18nextProvider>
        </AppProvider>
      </HappyProvider>
    </ConfigProvider>
  );
};

export default App;
