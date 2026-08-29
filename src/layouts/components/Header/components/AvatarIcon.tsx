import { ExclamationCircleOutlined, LoginOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, type MenuProps } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

import { logoutApi } from "@/apis/modules/login";
import avatar from "@/assets/images/avatar.png";
import { LOGIN_URL } from "@/config";
import { message, modal } from "@/hooks/useMessage";
import { useAuthStore, useUserStore } from "@/stores";

const AvatarIcon: React.FC = () => {
  const navigate = useNavigate();
  const setToken = useUserStore(state => state.setToken);
  const setAuthMenuList = useAuthStore(state => state.setAuthMenuList);

  const logout = () => {
    modal.confirm({
      title: "温馨提示 🧡",
      icon: <ExclamationCircleOutlined />,
      content: "是否确认退出登录？",
      okText: "确认",
      cancelText: "取消",
      mask: { closable: true },
      onOk: async () => {
        await logoutApi();
        setToken("");
        setAuthMenuList([]);
        navigate(LOGIN_URL, { replace: true });
        message.success("退出登录成功！");
      }
    });
  };

  const items: MenuProps["items"] = [
    {
      key: "logout",
      label: <span className="dropdown-item">退出登录</span>,
      icon: <LoginOutlined style={{ fontSize: "14px" }} />,
      onClick: logout
    }
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottom" arrow>
      <Avatar className="avatar" size={42} src={avatar} />
    </Dropdown>
  );
};

export default AvatarIcon;
