import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Switch, Tag } from 'antd';

import { AccountItem } from '@/apis/interface';
import { BUILTIN_USERNAMES, getRoles } from '@/apis/modules/system';
import AuthButton from '@/components/AuthButton';
import { Icon } from '@/components/Icon';

import { ACCOUNT_PERMS, STATUS_ENUM } from '../../constants';

export interface AccountColumnHandlers {
  canUpdate: boolean;
  onEdit: (record: AccountItem) => void;
  onResetPassword: (record: AccountItem) => void;
  onDelete: (ids: string[], names: string[]) => void;
  onToggleStatus: (record: AccountItem, checked: boolean) => void;
}

export function getAccountColumns(handlers: AccountColumnHandlers): ProColumns<AccountItem>[] {
  const { canUpdate, onEdit, onResetPassword, onDelete, onToggleStatus } = handlers;

  return [
    { title: '用户名', dataIndex: 'username', width: 140, copyable: true },
    { title: '昵称', dataIndex: 'nickName', width: 140 },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 90,
      valueEnum: {
        1: { text: '男' },
        2: { text: '女' }
      }
    },
    { title: '手机号', dataIndex: 'phone', width: 140, search: false },
    { title: '邮箱', dataIndex: 'email', width: 200, ellipsis: true, search: false },
    {
      title: '角色',
      dataIndex: 'roleIds',
      width: 200,
      search: false,
      render: (_, record) => {
        const roleNameMap = Object.fromEntries(getRoles().map(item => [item.id, item.roleName]));
        if (!record.roleIds.length) return <Tag>未分配</Tag>;
        return record.roleIds.map(id => (
          <Tag key={id} color='blue'>
            {roleNameMap[id] || id}
          </Tag>
        ));
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: STATUS_ENUM,
      render: (_, record) => (
        <Switch
          disabled={!canUpdate || BUILTIN_USERNAMES.includes(record.username)}
          checked={record.status === 1}
          onChange={checked => onToggleStatus(record, checked)}
        />
      )
    },
    { title: '创建时间', dataIndex: 'createTime', width: 180, search: false },
    {
      title: '操作',
      key: 'option',
      width: 240,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <AuthButton authority={ACCOUNT_PERMS.UPDATE}>
            <Button
              type='link'
              size='small'
              icon={<Icon className='text-14px' icon='ri:edit-line' />}
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
          </AuthButton>
          <AuthButton authority={ACCOUNT_PERMS.RESET}>
            <Button
              type='link'
              size='small'
              icon={<Icon className='text-14px' icon='ri:loop-left-line' />}
              onClick={() => onResetPassword(record)}
            >
              重置密码
            </Button>
          </AuthButton>
          <AuthButton authority={ACCOUNT_PERMS.DELETE}>
            <Button
              type='link'
              size='small'
              danger
              icon={<Icon className='text-14px' icon='ri:delete-bin-line' />}
              disabled={BUILTIN_USERNAMES.includes(record.username)}
              onClick={() => onDelete([record.id], [record.username])}
            >
              删除
            </Button>
          </AuthButton>
        </Space>
      )
    }
  ];
}
