import "./index.less";

import { useDebounceFn } from "ahooks";
import { Layout } from "antd";
import React, { useEffect } from "react";

import KeepAliveOutlet from "@/components/KeepAlive";
import LayoutFooter from "@/layouts/components/Footer";
import LayoutTabs from "@/layouts/components/Tabs";
import { useGlobalStore } from "@/stores";

import Maximize from "./components/Maximize";

const { Content } = Layout;

const LayoutMain: React.FC = () => {
  const { maximize, isCollapse, setGlobalState } = useGlobalStore(state => ({
    maximize: state.maximize,
    isCollapse: state.isCollapse,
    setGlobalState: state.setGlobalState
  }));

  // Monitor window changes, collapse menu
  const { run } = useDebounceFn(
    () => {
      const screenWidth = document.body.clientWidth;
      const shouldCollapse = screenWidth < 1200;
      if (isCollapse !== shouldCollapse) setGlobalState("isCollapse", shouldCollapse);
    },
    { wait: 100 }
  );
  useEffect(() => {
    window.addEventListener("resize", run, false);
    return () => window.removeEventListener("resize", run);
  }, []);

  // Monitor whether the current page is maximized, dynamically add class
  useEffect(() => {
    const root = document.getElementById("root") as HTMLElement;
    root.classList.toggle("main-maximize", maximize);
  }, [maximize]);

  return (
    <React.Fragment>
      <Maximize />
      <LayoutTabs />
      <Content>
        <KeepAliveOutlet />
      </Content>
      <LayoutFooter />
    </React.Fragment>
  );
};

export default LayoutMain;
