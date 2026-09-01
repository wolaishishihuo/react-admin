import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { type Key, useRef, useState } from 'react';

import { ReqCreateRole, ReqRoleList, RoleItem } from '@/apis/interface';
import {
  BUILTIN_ROLE_CODES,
  fetchCreateRole,
  fetchDeleteRole,
  fetchGetRoleList,
  fetchUpdateRole,
  getRoles
} from '@/apis/modules/system';
import AuthButton from '@/components/AuthButton';
import { Icon } from '@/components/Icon';
import { pagination } from '@/config/proTable';
import useAuthButton from '@/hooks/useAuthButton';
import { message, modal } from '@/hooks/useMessage';
import { formatDataForProTable } from '@/utils';

import { ROLE_PERMS } from '../constants';
import RoleFormModal from './components/RoleFormModal';
import { getRoleColumns } from './config/columns';

const RoleManage = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<RoleItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const { hasPerm } = useAuthButton();

  function reload() {
    setSelectedRowKeys([]);
    actionRef.current?.reload();
  }

  function openModal(record?: RoleItem) {
    setCurrent(record ?? null);
    setOpen(true);
  }

  async function handleSubmit(values: ReqCreateRole) {
    if (!hasPerm(current ? ROLE_PERMS.UPDATE : ROLE_PERMS.CREATE)) return;
    setSaving(true);
    try {
      if (current) await fetchUpdateRole({ ...current, ...values });
      else await fetchCreateRole(values);
      setOpen(false);
      message.success(current ? '编辑角色成功' : '新增角色成功');
      reload();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(ids: string[], names: string[]) {
    if (!hasPerm(ROLE_PERMS.DELETE)) return;
    const builtin = ids.some(id => BUILTIN_ROLE_CODES.includes(getRoles().find(item => item.id === id)?.roleCode || ''));
    if (builtin) {
      message.warning('系统内置角色不可删除');
      return;
    }
    modal.confirm({
      title: '温馨提示',
      content: `确认删除角色 ${names.map(name => `「${name}」`).join('、')} ？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await Promise.all(ids.map(id => fetchDeleteRole(id)));
        message.success('删除成功');
        reload();
      }
    });
  }

  async function handleToggleStatus(record: RoleItem, checked: boolean) {
    if (!hasPerm(ROLE_PERMS.UPDATE)) return;
    await fetchUpdateRole({ ...record, status: checked ? 1 : 0 });
    reload();
  }

  async function requestRoles(params: ReqRoleList) {
    return formatDataForProTable(await fetchGetRoleList(params));
  }

  function handleBatchDelete() {
    const rows = getRoles().filter(item => selectedRowKeys.includes(item.id));
    handleDelete(
      rows.map(item => item.id),
      rows.map(item => item.roleName)
    );
  }

  const columns = getRoleColumns({
    canUpdate: hasPerm(ROLE_PERMS.UPDATE),
    onEdit: openModal,
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus
  });

  return (
    <>
      <ProTable<RoleItem>
        className='ant-pro-table-scroll'
        columns={columns}
        actionRef={actionRef}
        bordered
        cardBordered
        rowKey='id'
        scroll={{ x: 1100, y: '100%' }}
        search={{ labelWidth: 'auto' }}
        form={{ name: 'role-manage-search' }}
        pagination={pagination}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        request={requestRoles}
        toolBarRender={() => [
          <AuthButton key='add' authority={ROLE_PERMS.CREATE}>
            <Button type='primary' icon={<Icon icon='ri:add-line' />} onClick={() => openModal()}>
              新增角色
            </Button>
          </AuthButton>,
          <AuthButton key='delete' authority={ROLE_PERMS.DELETE}>
            <Button
              danger
              disabled={!selectedRowKeys.length}
              icon={<Icon icon='ri:delete-bin-line' />}
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
          </AuthButton>
        ]}
      />
      <RoleFormModal open={open} saving={saving} current={current} onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
    </>
  );
};

export default RoleManage;
