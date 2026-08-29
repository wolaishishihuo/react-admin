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

export const buildTabMenuItems = (targetPath: string, handlers: TabMenuHandlers): MenuProps["items"] => {
  const isCurrent = targetPath === handlers.currentPath;

  return [
    {
      key: "refresh",
      label: <span>刷新</span>,
      icon: <ReloadOutlined style={iconStyle} />,
      disabled: !isCurrent,
      onClick: handlers.refresh
    },
    {
      key: "maximize",
      label: <span>最大化</span>,
      icon: <ExpandOutlined style={iconStyle} />,
      onClick: handlers.maximize
    },
    { type: "divider" },
    {
      key: "closeCurrent",
      label: <span>关闭当前</span>,
      icon: <CloseCircleOutlined style={iconStyle} />,
      onClick: () => handlers.closeCurrent(targetPath)
    },
    {
      key: "closeLeft",
      label: <span>关闭左侧</span>,
      icon: <VerticalRightOutlined style={iconStyle} />,
      onClick: () => handlers.closeLeft(targetPath)
    },
    {
      key: "closeRight",
      label: <span>关闭右侧</span>,
      icon: <VerticalLeftOutlined style={iconStyle} />,
      onClick: () => handlers.closeRight(targetPath)
    },
    { type: "divider" },
    {
      key: "closeOther",
      label: <span>关闭其它</span>,
      icon: <ColumnWidthOutlined style={iconStyle} />,
      onClick: () => handlers.closeOther(targetPath)
    },
    {
      key: "closeAll",
      label: <span>关闭所有</span>,
      icon: <SwitcherOutlined style={iconStyle} />,
      onClick: handlers.closeAll
    }
  ];
};
