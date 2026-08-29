import "./index.less";

import { Layout } from "antd";
import React from "react";

import { useGlobalStore } from "@/stores";

const { Footer } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutFooter: React.FC = () => {
  const footer = useGlobalStore(state => state.footer);

  return (
    <React.Fragment>
      {footer && (
        <Footer className="ant-footer flex-center">
          <a href="#" target="_blank" rel="noreferrer">
            2026 © {APP_TITLE}
          </a>
        </Footer>
      )}
    </React.Fragment>
  );
};

export default LayoutFooter;
