import "./index.less";

import { Button, Card, Result } from "antd";

const Bing: React.FC = () => {
  return (
    <Card
      className="bing"
      title="Bing 搜索"
      extra={
        <a href="https://www.bing.com/" target="_blank" rel="noreferrer">
          新窗口打开
        </a>
      }
    >
      <Result
        status="warning"
        title="无法在页面内嵌入 Bing"
        subTitle="Bing 设置了 X-Frame-Options: sameorigin，浏览器不允许在 iframe 中加载。请使用新窗口访问。"
        extra={
          <Button type="primary" href="https://www.bing.com/" target="_blank" rel="noreferrer">
            打开 Bing
          </Button>
        }
      />
    </Card>
  );
};

export default Bing;
