import {
  CloseCircleOutlined,
  ColumnWidthOutlined,
  ExpandOutlined,
  ReloadOutlined,
  SwitcherOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { TFunction } from "i18next";

const iconStyle = { fontSize: 14 };

type TabMenuHandlers = {
  currentPath: string;
  refresh: () => void;
  maximize: () => void;
  closeCurrent: (path: string) => void;
  closeLeft: (path: string) => void;
  closeRight: (path: string) => void;
  closeOther: (path: string) => void;
  closeAll: () => void;
};

export const buildTabMenuItems = (targetPath: string, t: TFunction, handlers: TabMenuHandlers): MenuProps["items"] => {
  const isCurrent = targetPath === handlers.currentPath;

  return [
    {
      key: "refresh",
      label: <span>{t("tabs.refresh")}</span>,
      icon: <ReloadOutlined style={iconStyle} />,
      disabled: !isCurrent,
      onClick: handlers.refresh
    },
    {
      key: "maximize",
      label: <span>{t("tabs.maximize")}</span>,
      icon: <ExpandOutlined style={iconStyle} />,
      onClick: handlers.maximize
    },
    { type: "divider" },
    {
      key: "closeCurrent",
      label: <span>{t("tabs.closeCurrent")}</span>,
      icon: <CloseCircleOutlined style={iconStyle} />,
      onClick: () => handlers.closeCurrent(targetPath)
    },
    {
      key: "closeLeft",
      label: <span>{t("tabs.closeLeft")}</span>,
      icon: <VerticalRightOutlined style={iconStyle} />,
      onClick: () => handlers.closeLeft(targetPath)
    },
    {
      key: "closeRight",
      label: <span>{t("tabs.closeRight")}</span>,
      icon: <VerticalLeftOutlined style={iconStyle} />,
      onClick: () => handlers.closeRight(targetPath)
    },
    { type: "divider" },
    {
      key: "closeOther",
      label: <span>{t("tabs.closeOther")}</span>,
      icon: <ColumnWidthOutlined style={iconStyle} />,
      onClick: () => handlers.closeOther(targetPath)
    },
    {
      key: "closeAll",
      label: <span>{t("tabs.closeAll")}</span>,
      icon: <SwitcherOutlined style={iconStyle} />,
      onClick: handlers.closeAll
    }
  ];
};
