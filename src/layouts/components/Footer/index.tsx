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
        <Footer className="ant-footer">
          <a href="#" target="_blank" rel="noreferrer">
            2023 © {APP_TITLE} By Hooks Technology.
          </a>
        </Footer>
      )}
    </React.Fragment>
  );
};

export default LayoutFooter;
