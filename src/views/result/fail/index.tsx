import { Button, Card, Result } from "antd";
import React from "react";

const Fail: React.FC = () => {
  return (
    <Card className="fail">
      <Result
        status="error"
        title="Submission Failed"
        subTitle="Please check and modify the following information before resubmitting."
        extra={[
          <Button type="primary" key="console">
            Go Console
          </Button>,
          <Button key="buy">Buy Again</Button>
        ]}
      ></Result>
    </Card>
  );
};

export default Fail;
