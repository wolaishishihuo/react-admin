import { Card, Divider, Input, Typography } from "antd";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { useTabsStore } from "@/stores";

const { Title } = Typography;

const TabsDetail: React.FC = () => {
  const { id } = useParams();
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("params");

  const [value, setValue] = useState("");

  const setTabTitle = useTabsStore(state => state.setTabTitle);

  useEffect(() => {
    setTabTitle(`No.${id} - Tab 详情`);
  }, []);

  return (
    <Card>
      <Title level={4}> 我是 Tab 详情页</Title>
      <Title level={5}>params ：{id}</Title>
      {query && <Title level={5}>query ：{query}</Title>}
      <Divider dashed />
      <Input value={value} onChange={e => setValue(e.target.value)} placeholder="测试详情页 KeepAlive" />
    </Card>
  );
};

export default TabsDetail;
