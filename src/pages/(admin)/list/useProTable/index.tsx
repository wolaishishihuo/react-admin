import { Icon as SvgIcon } from '@iconify/react/offline';
import { ProTable, type ActionType, type ProColumns, type ProTableProps } from '@ant-design/pro-components';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Col, Form, Input, Modal, Popconfirm, Radio, Row, Space, Switch } from 'antd';
import { useCallback, useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Icon } from '@/components/Icon';
import IconSelect from '@/components/IconSelect';
import { useAuthButton } from '@/features/navigation/menu-permissions';
import useTableOperate from '@/hooks/useTableOperate';
import { message } from '@/app/feedback';
import { navigateTo } from '@/router/router-ref';
import { asFormRule } from '@/utils/form-rule';
import { validatePhone } from '@/utils/validate';
import { type ReqUserList, type UserItem } from './modules/types';
import { createUser, deleteUsers, updateUser } from './modules/api';
import { userListOptions } from './modules/queries';
import { PRO_TABLE_PAGINATION } from './modules/table-config';
import './index.less';

export const Route = createFileRoute('/(admin)/list/useProTable/')({
  component: UseProTable,
  staticData: {
    title: '用户列表',
    keepAlive: true,
    tab: { multi: false }
  }
});

const GENDER_OPTIONS = [
  { label: '男', value: 0 },
  { label: '女', value: 1 },
  { label: '保密', value: 2 }
];
const GENDER_VALUE_ENUM = new Map(GENDER_OPTIONS.map(item => [item.value, { text: item.label }]));
const STATUS_VALUE_ENUM = new Map([
  [1, { text: '启用' }],
  [0, { text: '停用' }]
]);
const TABLE_SCROLL_X = 1000;

type UserSearch = Omit<ReqUserList, 'page' | 'limit'>;

function UseProTable() {
  const { BUTTONS } = useAuthButton();
  const queryClient = useQueryClient();
  const actionRef = useRef<ActionType>(undefined);

  const requestUsers = useCallback<NonNullable<ProTableProps<UserItem, UserSearch>['request']>>(
    async ({ current: page = 1, pageSize: limit = 10, username, gender, status }) => {
      const query: ReqUserList = { page, limit, username, gender, status };
      const result = await queryClient.fetchQuery(userListOptions(query));

      // 删除末页最后一行后回退到有效页
      if (result.list.length === 0 && page > 1) {
        const lastPage = Math.max(Math.ceil(result.total / limit), 1);
        if (lastPage < page) actionRef.current?.setPageInfo?.({ current: lastPage });
      }

      return { data: result.list, total: result.total, success: true };
    },
    [queryClient]
  );

  async function refreshUsers() {
    await actionRef.current?.reload();
  }

  const { checkedRowKeys, generalPopupOperation, handleAdd, handleEdit, onBatchDeleted, onDeleted, rowSelection, submitting } =
    useTableOperate<UserItem>([], refreshUsers, saveUser);

  /** 新增/编辑分流，status 归一 0/1 */
  async function saveUser(res: UserItem, operateType: 'add' | 'edit', editing?: UserItem) {
    const payload = { ...res, status: res.status ? 1 : 0 };
    if (operateType === 'add') await createUser(payload);
    else await updateUser({ ...payload, id: editing!.id });
  }

  async function handleDelete(id: string) {
    await deleteUsers([id]);
    await onDeleted();
  }

  async function handleBatchDelete() {
    await deleteUsers(checkedRowKeys.map(String));
    await onBatchDeleted();
  }

  async function handleToggleStatus(record: UserItem, checked: boolean) {
    await updateUser({ ...record, status: checked ? 1 : 0 });
    message.success(checked ? '已启用' : '已停用');
    await refreshUsers();
  }

  const columns: ProColumns<UserItem>[] = [
    {
      key: 'index',
      title: '序号',
      valueType: 'index',
      width: 70,
      align: 'center',
      search: false,
      render: (_, _record, index, action) => {
        const { current = 1, pageSize = 10 } = action?.pageInfo ?? {};
        return (current - 1) * pageSize + index + 1;
      }
    },
    { key: 'username', title: '用户名', dataIndex: 'username', width: 140 },
    {
      key: 'gender',
      title: '性别',
      dataIndex: 'gender',
      valueType: 'select',
      valueEnum: GENDER_VALUE_ENUM,
      width: 90,
      align: 'center'
    },
    { key: 'mobile', title: '手机号', dataIndex: 'mobile', width: 140, search: false },
    {
      key: 'icon',
      title: '图标',
      dataIndex: 'icon',
      width: 90,
      align: 'center',
      search: false,
      render: (_, record) => <Icon name={record.icon} className='text-18px' />
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: STATUS_VALUE_ENUM,
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 1}
          disabled={!BUTTONS.status}
          size='small'
          onChange={checked => handleToggleStatus(record, checked)}
        />
      )
    },
    { key: 'createTime', title: '创建时间', dataIndex: 'createTime', width: 180, search: false },
    {
      key: 'option',
      title: '操作',
      width: 190,
      align: 'center',
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0}>
          <Button size='small' type='link' onClick={() => navigateTo(`/list/useProTable/detail?id=${record.id}`)}>
            详情
          </Button>
          {BUTTONS.edit && (
            <Button size='small' type='link' onClick={() => handleEdit(record)}>
              编辑
            </Button>
          )}
          {BUTTONS.delete && (
            <Popconfirm title='确认删除吗？' onConfirm={() => handleDelete(record.id)}>
              <Button danger size='small' type='link'>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <ProTable<UserItem, UserSearch>
        actionRef={actionRef}
        cardProps={{ className: 'app-pro-table-card' }}
        className='app-pro-table'
        columns={columns}
        onRequestError={() => undefined}
        pagination={PRO_TABLE_PAGINATION}
        request={requestUsers}
        rowKey='id'
        rowSelection={rowSelection}
        scroll={{ x: TABLE_SCROLL_X, y: '100%' }}
        search={{ labelWidth: 'auto' }}
        toolBarRender={() => [
          <Space key='actions' size={8} wrap>
            {BUTTONS.add && (
              <Button
                icon={<SvgIcon icon='ri:add-line' className='align--2px inline-block' />}
                type='primary'
                onClick={handleAdd}
              >
                新增
              </Button>
            )}
            {BUTTONS.batchDelete && (
              <Popconfirm title='确认删除吗？' onConfirm={handleBatchDelete}>
                <Button
                  danger
                  disabled={checkedRowKeys.length === 0}
                  icon={<SvgIcon icon='ri:delete-bin-line' className='align--2px inline-block' />}
                >
                  批量删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        ]}
      />

      <Modal
        confirmLoading={submitting}
        open={generalPopupOperation.open}
        title={generalPopupOperation.operateType === 'add' ? '新增用户' : '编辑用户'}
        width={520}
        onCancel={generalPopupOperation.onClose}
        onOk={generalPopupOperation.handleSubmit}
      >
        <Form form={generalPopupOperation.form} layout='vertical'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label='用户名' name='username' rules={[{ required: true, message: '请输入用户名' }]}>
                <Input allowClear placeholder='请输入用户名' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='手机号' name='mobile' rules={[asFormRule(validatePhone, '手机号格式不正确')]}>
                <Input allowClear maxLength={11} placeholder='请输入手机号' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item initialValue={2} label='性别' name='gender'>
                <Radio.Group options={GENDER_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='图标' name='icon' rules={[{ required: true, message: '请选择图标' }]}>
                <IconSelect placeholder='请选择图标' />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item initialValue={1} label='状态' name='status' valuePropName='checked'>
            <Switch checkedChildren='启用' unCheckedChildren='停用' />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
