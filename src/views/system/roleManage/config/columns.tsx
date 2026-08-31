import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Switch, Tag } from 'antd';

import { RoleItem } from '@/apis/interface';
import { BUILTIN_ROLE_CODES } from '@/apis/modules/system';
import { Icon } from '@/components/Icon';

import { STATUS_ENUM } from '../../constants';

export interface RoleColumnHandlers {
  onEdit: (record: RoleItem) => void;
  onDelete: (ids: string[], names: string[]) => void;
  onToggleStatus: (record: RoleItem, checked: boolean) => void;
}

export function getRoleColumns(handlers: RoleColumnHandlers): ProColumns<RoleItem>[] {
  const { onEdit, onDelete, onToggleStatus } = handlers;

  return [
    { title: '角色名称', dataIndex: 'roleName', width: 160, ellipsis: true },
    { title: '角色标识', dataIndex: 'roleCode', width: 140, copyable: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueEnum: STATUS_ENUM,
      render: (_, record) => (
        <Switch
          disabled={BUILTIN_ROLE_CODES.includes(record.roleCode)}
          checked={record.status === 1}
          onChange={checked => onToggleStatus(record, checked)}
        />
      )
    },
    {
      title: '菜单权限',
      dataIndex: 'menuIds',
      width: 120,
      search: false,
      render: (_, record) => <Tag color='blue'>{record.menuIds.length} 项</Tag>
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true, search: false },
    { title: '创建时间', dataIndex: 'createTime', width: 180, search: false },
    {
      title: '操作',
      key: 'option',
      width: 160,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space>
          <Button
            type='link'
            size='small'
            icon={<Icon className='text-14px' icon='ri:edit-line' />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Button
            type='link'
            size='small'
            danger
            icon={<Icon className='text-14px' icon='ri:delete-bin-line' />}
            disabled={BUILTIN_ROLE_CODES.includes(record.roleCode)}
            onClick={() => onDelete([record.id], [record.roleName])}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];
}
