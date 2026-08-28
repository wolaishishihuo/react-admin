import React from "react";

import LazyComponent from "@/components/Lazy";
import ThemeDrawer from "@/layouts/components/ThemeDrawer";
import { useGlobalStore } from "@/stores";

import LayoutWatermark from "./components/LayoutWatermark";

const LayoutIndex: React.FC = () => {
  const layout = useGlobalStore(state => state.layout);

  const LayoutComponents = {
    vertical: React.lazy(() => import("./LayoutVertical")),
    classic: React.lazy(() => import("./LayoutClassic")),
    transverse: React.lazy(() => import("./LayoutTransverse")),
    columns: React.lazy(() => import("./LayoutColumns"))
  };

  return (
    <LayoutWatermark>
      {LazyComponent(LayoutComponents[layout])}
      <ThemeDrawer />
    </LayoutWatermark>
  );
};

export default LayoutIndex;
