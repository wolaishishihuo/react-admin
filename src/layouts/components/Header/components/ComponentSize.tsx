import { Dropdown, type MenuProps } from "antd";

import { useGlobalStore } from "@/stores";
import type { SizeType } from "@/stores/interface";

const ComponentSize: React.FC = () => {
  const componentSize = useGlobalStore(state => state.componentSize);
  const setGlobalState = useGlobalStore(state => state.setGlobalState);

  const setComponentSize: MenuProps["onClick"] = val => {
    setGlobalState("componentSize", val.key as SizeType);
  };

  const items: MenuProps["items"] = [
    { key: "middle", label: "默认", disabled: componentSize === "middle" },
    { key: "large", label: "大型", disabled: componentSize === "large" },
    { key: "small", label: "小型", disabled: componentSize === "small" }
  ];

  const menuProps = {
    items,
    onClick: setComponentSize
  };

  return (
    <Dropdown menu={menuProps} placement="bottom" arrow trigger={["click"]}>
      <i className="iconfont icon-contentright"></i>
    </Dropdown>
  );
};

export default ComponentSize;
