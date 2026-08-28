import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import { useRef } from "react";

import { UserList } from "@/apis/interface";
import { getUserList } from "@/apis/modules/user";
import { pagination } from "@/config/proTable";
import { formatDataForProTable } from "@/utils";

const columns: ProColumns<UserList>[] = [
  {
    title: "用户名",
    dataIndex: "username",
    copyable: true,
    width: 200
  },
  {
    title: "性别",
    dataIndex: "gender",
    width: 150,
    valueEnum: {
      1: { text: "男" },
      2: { text: "女" }
    }
  },
  {
    title: "年龄",
    dataIndex: "age",
    width: 150
  },
  {
    title: "邮箱",
    dataIndex: "email",
    search: false
  },
  {
    title: "地址",
    dataIndex: "address",
    search: false
  },
  {
    title: "创建时间",
    key: "createTime",
    dataIndex: "createTime",
    valueType: "date",
    sorter: true,
    search: false
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    valueType: "dateRange",
    hideInTable: true,
    search: { transform: value => ({ startTime: value[0], endTime: value[1] }) }
  },
  {
    title: "操作",
    key: "option",
    fixed: "right",
    width: 250,
    search: false,
    render: () => action()
  }
];

const action = () => [
  <Button key="view" type="link" size="small" icon={<EyeOutlined />}>
    查看
  </Button>,
  <Button key="edit" type="link" size="small" icon={<EditOutlined />}>
    编辑
  </Button>,
  <Button key="delete" type="link" size="small" danger icon={<DeleteOutlined />}>
    删除
  </Button>
];

const toolBarRender = () => [
  <Button type="primary" key="button" icon={<PlusOutlined />}>
    新建
  </Button>
];

const useProTable = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);

  return (
    <ProTable<UserList>
      className="ant-pro-table-scroll"
      columns={columns}
      actionRef={actionRef}
      bordered
      cardBordered
      scroll={{ x: 1000, y: "100%" }}
      request={async params => {
        const { data } = await getUserList(params);
        return formatDataForProTable<UserList>(data);
      }}
      columnsState={{
        persistenceKey: "use-pro-table-key",
        persistenceType: "localStorage"
      }}
      rowKey="id"
      search={{ labelWidth: "auto" }}
      form={{ name: "use-pro-table-search" }}
      pagination={pagination}
      dateFormatter="string"
      headerTitle="使用 ProTable"
      toolBarRender={toolBarRender}
    />
  );
};

export default useProTable;
