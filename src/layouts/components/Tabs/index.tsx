import "./index.less";

import { CloseOutlined, DownOutlined } from "@ant-design/icons";
import { useUpdateEffect } from "ahooks";
import { Dropdown } from "antd";
import React, { useContext, useEffect, useRef } from "react";
import { useLocation, useMatches, useNavigate } from "react-router-dom";

import { Icon } from "@/components/Icon";
import { HOME_URL } from "@/config";
import { RefreshContext } from "@/context/Refresh";
import { MetaProps } from "@/routers/interface";
import { useAuthStore, useGlobalStore, useTabsStore } from "@/stores";

import { buildTabMenuItems } from "./tabMenu";

const LayoutTabs: React.FC = () => {
  const matches = useMatches();
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname + location.search;
  const scrollRef = useRef<HTMLDivElement>(null);

  const { tabs, tabsIcon } = useGlobalStore(state => ({
    tabs: state.tabs,
    tabsIcon: state.tabsIcon
  }));
  const setGlobalState = useGlobalStore(state => state.setGlobalState);
  const { tabsList, addTab, removeTab, closeTabsOnSide, closeMultipleTab } = useTabsStore(state => ({
    tabsList: state.tabsList,
    addTab: state.addTab,
    removeTab: state.removeTab,
    closeTabsOnSide: state.closeTabsOnSide,
    closeMultipleTab: state.closeMultipleTab
  }));
  const flatMenuList = useAuthStore(state => state.flatMenuList);
  const { refresh } = useContext(RefreshContext);

  useEffect(() => initTabs(), []);

  const initTabs = () => {
    flatMenuList.forEach(item => {
      if (item.meta?.isAffix && !item.meta.isHide && !item.meta.isFull) {
        addTab({
          icon: item.meta.icon!,
          title: item.meta.title!,
          path: item.path!,
          closable: !item.meta.isAffix
        });
      }
    });
  };

  useUpdateEffect(() => {
    const meta = matches[matches.length - 1].data as MetaProps & { redirect: boolean };
    if (!meta?.redirect) {
      addTab({
        icon: meta.icon!,
        title: meta.title!,
        path,
        closable: !meta.isAffix
      });
    }
  }, [matches]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onWheel = (event: WheelEvent) => {
      if (scroller.scrollWidth <= scroller.clientWidth) return;
      event.preventDefault();
      scroller.scrollLeft += event.deltaY + event.deltaX;
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [tabs]);

  useEffect(() => {
    const active = scrollRef.current?.querySelector<HTMLElement>(".work-tab-item.is-active");
    active?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [path, tabsList]);

  const handlers = {
    currentPath: path,
    refresh,
    maximize: () => setGlobalState("maximize", true),
    closeCurrent: (tabPath: string) => removeTab(tabPath, tabPath === path),
    closeLeft: (tabPath: string) => closeTabsOnSide(tabPath, "left"),
    closeRight: (tabPath: string) => closeTabsOnSide(tabPath, "right"),
    closeOther: (tabPath: string) => closeMultipleTab(tabPath),
    closeAll: () => {
      closeMultipleTab();
      navigate(HOME_URL);
    }
  };

  const closeTab = (event: React.MouseEvent, tabPath: string, closable: boolean) => {
    event.stopPropagation();
    if (!closable) return;
    removeTab(tabPath, tabPath === path);
  };

  if (!tabs) return null;

  return (
    <div className="work-tab">
      <div className="work-tab-scroll" ref={scrollRef}>
        <ul className="work-tab-list">
          {tabsList.map(item => {
            const active = item.path === path;
            const showClose = item.closable && tabsList.length > 1;

            return (
              <Dropdown key={item.path} trigger={["contextMenu"]} menu={{ items: buildTabMenuItems(item.path, handlers) }}>
                <li className={`work-tab-item${active ? " is-active" : ""}`} onClick={() => navigate(item.path)}>
                  {tabsIcon && item.icon && <Icon className="work-tab-icon" name={item.icon} />}
                  <span className="work-tab-title">{item.title}</span>
                  {showClose && (
                    <span className="work-tab-close" onClick={event => closeTab(event, item.path, item.closable)}>
                      <CloseOutlined />
                    </span>
                  )}
                </li>
              </Dropdown>
            );
          })}
        </ul>
      </div>
      <Dropdown trigger={["click"]} menu={{ items: buildTabMenuItems(path, handlers) }}>
        <button className="work-tab-more" type="button">
          <DownOutlined />
        </button>
      </Dropdown>
    </div>
  );
};

export default LayoutTabs;
