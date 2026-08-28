import "./index.less";

import { Layout } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import logo from "@/assets/images/logo.svg";
import { Icon } from "@/components/Icon";
import ToolBarLeft from "@/layouts/components/Header/ToolBarLeft";
import ToolBarRight from "@/layouts/components/Header/ToolBarRight";
import LayoutMain from "@/layouts/components/Main";
import LayoutMenu from "@/layouts/components/Menu";
import { LAYOUT_SIDER_COLLAPSED_WIDTH, LAYOUT_SIDER_WIDTH } from "@/layouts/constants";
import { RouteObjectType } from "@/routers/interface";
import { useAuthStore, useGlobalStore } from "@/stores";

const { Sider } = Layout;

const APP_TITLE = import.meta.env.VITE_GLOB_APP_TITLE;

const LayoutColumns: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isCollapse = useGlobalStore(state => state.isCollapse);
  const showMenuList = useAuthStore(state => state.showMenuList);

  const [menuActive, setMenuActive] = useState("");
  const [subMenuList, setSubMenuList] = useState<RouteObjectType[]>([]);

  useEffect(() => {
    if (!showMenuList.length) return;
    const menuItem = showMenuList.find(item => {
      return pathname === item.path || `/${pathname.split("/")[1]}` === item.path;
    });
    setMenuActive(pathname);
    setSubMenuList(menuItem?.children || []);
  }, [pathname]);

  const handleNavigation = (item: RouteObjectType) => {
    if (item.meta?.isLink) window.open(item.meta.isLink, "_blank");
    navigate(item.path!);
  };

  const changeSubMenu = (item: RouteObjectType) => {
    setMenuActive(item.path!);
    setSubMenuList(item.children || []);
    handleNavigation(item.children?.length ? item.children[0] : item);
  };

  return (
    <section className="layout-columns">
      <div className="sider-split">
        <div className="logo">
          <img src={logo} alt="logo" className="logo-img" />
        </div>
        <div className="menu-list">
          {showMenuList.map(item => {
            return (
              <div
                key={item.path}
                className={`menu-item ${
                  (menuActive === item.path || `/${menuActive.split("/")[1]}` === item.path) && "menu-active"
                }`}
                onClick={() => changeSubMenu(item)}
              >
                <Icon name={item.meta!.icon!} />
                <span className="title sle">{item.meta?.title}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Sider
        width={LAYOUT_SIDER_WIDTH}
        collapsedWidth={LAYOUT_SIDER_COLLAPSED_WIDTH}
        collapsed={isCollapse}
        className={`${!subMenuList.length && "not-sider"}`}
      >
        {subMenuList.length ? (
          <React.Fragment>
            <div className="logo">
              <span className="logo-text">{isCollapse ? "H" : APP_TITLE}</span>
            </div>
            <LayoutMenu mode="inline" menuList={subMenuList} />
          </React.Fragment>
        ) : null}
      </Sider>
      <LayoutMain
        header={
          <React.Fragment>
            <ToolBarLeft />
            <ToolBarRight />
          </React.Fragment>
        }
      />
    </section>
  );
};

export default LayoutColumns;
