import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { type Key, useRef, useState } from 'react';

import { AccountItem, ReqAccountList } from '@/apis/interface';
import {
  BUILTIN_USERNAMES,
  fetchCreateAccount,
  fetchDeleteAccount,
  fetchGetAccountList,
  fetchResetAccountPassword,
  fetchUpdateAccount,
  getAccounts
} from '@/apis/modules/system';
import { Icon } from '@/components/Icon';
import { pagination } from '@/config/proTable';
import { message, modal } from '@/hooks/useMessage';
import { formatDataForProTable } from '@/utils';

import AccountFormModal, { AccountFormValues } from './components/AccountFormModal';
import { getAccountColumns } from './config/columns';

const AccountManage = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<AccountItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  function reload() {
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  }

  function openModal(record?: AccountItem) {
    setCurrent(record ?? null);
    setOpen(true);
  }

  async function handleSubmit(values: AccountFormValues) {
    setSaving(true);
    try {
      const payload = {
        username: values.username,
        nickName: values.nickName,
        gender: values.gender,
        phone: values.phone,
        email: values.email,
        roleIds: values.roleIds,
        status: values.status,
        remark: values.remark || ''
      };
      if (current) await fetchUpdateAccount({ ...current, ...payload });
      else await fetchCreateAccount(payload);
      setOpen(false);
      message.success(current ? '编辑账号成功' : '新增账号成功');
      reload();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(ids: string[], names: string[]) {
    const builtin = ids.some(id => BUILTIN_USERNAMES.includes(getAccounts().find(item => item.id === id)?.username || ''));
    if (builtin) {
      message.warning('系统内置账号不可删除');
      return;
    }
    modal.confirm({
      title: '温馨提示',
      content: `确认删除账号 ${names.map(name => `「${name}」`).join('、')} ？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await Promise.all(ids.map(id => fetchDeleteAccount(id)));
        message.success('删除成功');
        reload();
      }
    });
  }

  function handleResetPassword(record: AccountItem) {
    modal.confirm({
      title: '温馨提示',
      content: `确认将「${record.username}」的密码重置为 123456 ？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await fetchResetAccountPassword();
        message.success('密码已重置为 123456');
      }
    });
  }

  async function handleToggleStatus(record: AccountItem, checked: boolean) {
    await fetchUpdateAccount({ ...record, status: checked ? 1 : 0 });
    reload();
  }

  async function requestAccounts(params: ReqAccountList) {
    return formatDataForProTable(await fetchGetAccountList(params));
  }

  function handleBatchDelete() {
    const rows = getAccounts().filter(item => selectedRowKeys.includes(item.id));
    handleDelete(
      rows.map(item => item.id),
      rows.map(item => item.username)
    );
  }

  const columns = getAccountColumns({
    onEdit: openModal,
    onResetPassword: handleResetPassword,
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus
  });

  return (
    <>
      <ProTable<AccountItem>
        className='ant-pro-table-scroll'
        columns={columns}
        actionRef={actionRef}
        bordered
        cardBordered
        rowKey='id'
        scroll={{ x: 1400, y: '100%' }}
        search={{ labelWidth: 'auto' }}
        form={{ name: 'account-manage-search' }}
        pagination={pagination}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        request={requestAccounts}
        toolBarRender={() => [
          <Button key='add' type='primary' icon={<Icon icon='ri:add-line' />} onClick={() => openModal()}>
            新增账号
          </Button>,
          <Button
            key='delete'
            danger
            disabled={!selectedRowKeys.length}
            icon={<Icon icon='ri:delete-bin-line' />}
            onClick={handleBatchDelete}
          >
            批量删除
          </Button>
        ]}
      />
      <AccountFormModal open={open} saving={saving} current={current} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
    </>
  );
};

export default AccountManage;
