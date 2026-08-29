import "./index.less";

import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotAuth = () => {
  const navigate = useNavigate();

  return (
    <Result
      className="error-page"
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问该页面。"
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          返回
        </Button>
      }
    />
  );
};

export default NotAuth;
