import { Button, Card, Result } from "antd";
import React from "react";

const Warning: React.FC = () => {
  return (
    <Card className="warning">
      <Result
        status="warning"
        title="There are some problems with your operation."
        subTitle="The data you submitted does not comply with the rules."
        extra={[
          <Button type="primary" key="console">
            Go Console
          </Button>,
          <Button key="buy">Buy Again</Button>
        ]}
      />
    </Card>
  );
};

export default Warning;
