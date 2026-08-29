import "./index.less";

import { Card, Descriptions, Tag, Typography } from "antd";
import React from "react";

const { Link, Title } = Typography;
const style = { width: "280px" };

const About: React.FC = () => {
  const { pkg, lastBuildTime } = __APP_INFO__;
  const { dependencies, devDependencies, version } = pkg;

  return (
    <div className="about-content">
      <Card className="mb10">
        <Title level={4} className="mb15">
          关于
        </Title>
        <span className="text">
          <Link href="https://github.com/wolaishishihuo/react-admin" target="_blank">
            React Admin{" "}
          </Link>
          一款基于 React 19、React-Router v7、React Hooks、Zustand、TypeScript、Vite 8、Ant Design 6 的后台管理框架。
        </span>
      </Card>

      <Card className="mb10">
        <Title level={4} className="mb15">
          项目信息
        </Title>
        <Descriptions column={2} bordered size="middle" styles={{ label: style }}>
          <Descriptions.Item label="版本号">
            <Tag color="processing">{version}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="发布时间">
            <Tag color="processing">{lastBuildTime}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="作者">
            <Link href="https://github.com/wolaishishihuo" target="_blank">
              wolaishishihuo
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Github">
            <Link href="https://github.com/wolaishishihuo/react-admin" target="_blank">
              Github
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Issues">
            <Link href="https://github.com/wolaishishihuo/react-admin/issues" target="_blank">
              Issues
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="仓库地址">
            <Link href="https://github.com/wolaishishihuo/react-admin" target="_blank">
              react-admin
            </Link>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="mb10">
        <Title level={4} className="mb15">
          生产环境依赖
        </Title>
        <Descriptions column={3} bordered size="middle" styles={{ label: style }}>
          {Object.keys(dependencies).map(key => {
            return (
              <React.Fragment key={key}>
                <Descriptions.Item label={key}>
                  <Tag color="default">{dependencies[key]} </Tag>
                </Descriptions.Item>
              </React.Fragment>
            );
          })}
        </Descriptions>
      </Card>

      <Card>
        <Title level={4} className="mb15">
          开发环境依赖
        </Title>
        <Descriptions column={3} bordered size="middle" styles={{ label: style }}>
          {Object.keys(devDependencies).map(key => {
            return (
              <React.Fragment key={key}>
                <Descriptions.Item label={key}>
                  <Tag color="default">{devDependencies[key]} </Tag>
                </Descriptions.Item>
              </React.Fragment>
            );
          })}
        </Descriptions>
      </Card>
    </div>
  );
};

export default About;
