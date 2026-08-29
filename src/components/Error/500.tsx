import "./index.less";

import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotNetwork = () => {
  const navigate = useNavigate();

  return (
    <Result
      className="error-page"
      status="500"
      title="500"
      subTitle="抱歉，服务器出了点问题。"
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          返回
        </Button>
      }
    />
  );
};

export default NotNetwork;
