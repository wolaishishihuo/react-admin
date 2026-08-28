import { ProList } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";

const dataSource = [
  {
    id: "1",
    name: "语雀的天空",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  },
  {
    id: "2",
    name: "Ant Design",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  },
  {
    id: "3",
    name: "蚂蚁金服体验科技",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  },
  {
    id: "4",
    name: "TechUI",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  },
  {
    id: "5",
    name: "语雀的天空",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  },
  {
    id: "6",
    name: "Ant Design",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  },
  {
    id: "7",
    name: "蚂蚁金服体验科技",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  },
  {
    id: "8",
    name: "TechUI",
    image: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
    desc: "我是一条测试的描述"
  }
];

const UseProList = () => (
  <ProList
    toolBarRender={() => {
      return [
        <Button key="add" type="primary">
          新建
        </Button>
      ];
    }}
    onRow={record => {
      return {
        onMouseEnter: () => {
          console.log(record);
        },
        onClick: () => {
          console.log(record);
        }
      };
    }}
    rowKey="id"
    headerTitle="使用 ProList"
    tooltip="基础列表的配置"
    dataSource={dataSource}
    cardBordered
    search={false}
    form={{ name: "pro-list-demo" }}
    columns={[
      { dataIndex: "name", listSlot: "title" },
      { dataIndex: "image", listSlot: "avatar" },
      { dataIndex: "desc", listSlot: "description" },
      {
        listSlot: "subTitle",
        render: () => {
          return (
            <Space size={0}>
              <Tag color="blue">Ant Design</Tag>
              <Tag color="#5BD8A6">TechUI</Tag>
            </Space>
          );
        }
      },
      {
        listSlot: "actions",
        render: () => [
          <a target="_blank" rel="noopener noreferrer" key="link">
            链路
          </a>,
          <a target="_blank" rel="noopener noreferrer" key="warning">
            报警
          </a>,
          <a target="_blank" rel="noopener noreferrer" key="view">
            查看
          </a>
        ]
      }
    ]}
  />
);

export default UseProList;
