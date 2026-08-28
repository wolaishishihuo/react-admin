import "./index.less";

import { useDebounceFn } from "ahooks";
import React, { useEffect } from "react";

import KeepAliveOutlet from "@/components/KeepAlive";
import LayoutFooter from "@/layouts/components/Footer";
import LayoutTabs from "@/layouts/components/Tabs";
import { useGlobalStore } from "@/stores";

import Maximize from "./components/Maximize";

interface LayoutMainProps {
  header?: React.ReactNode;
}

const LayoutMain: React.FC<LayoutMainProps> = ({ header }) => {
  const { maximize, isCollapse, setGlobalState } = useGlobalStore(state => ({
    maximize: state.maximize,
    isCollapse: state.isCollapse,
    setGlobalState: state.setGlobalState
  }));

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

  useEffect(() => {
    const root = document.getElementById("root") as HTMLElement;
    root.classList.toggle("main-maximize", maximize);
  }, [maximize]);

  return (
    <main className="app-main">
      <header className="app-header">
        {header && <div className="app-header-bar">{header}</div>}
        <LayoutTabs />
      </header>
      <Maximize />
      <div className="app-content">
        <KeepAliveOutlet />
      </div>
      <LayoutFooter />
    </main>
  );
};

export default LayoutMain;
