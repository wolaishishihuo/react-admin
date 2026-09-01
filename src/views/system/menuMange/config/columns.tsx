import type { ProColumns } from '@ant-design/pro-components';
import { Button, Switch, Tag } from 'antd';

import { MenuItem } from '@/apis/interface';
import AuthButton from '@/components/AuthButton';
import { Icon } from '@/components/Icon';

import { MENU_PERMS, STATUS_ENUM } from '../../constants';

export interface MenuColumnHandlers {
  canUpdate: boolean;
  onAddChild: (record: MenuItem) => void;
  onEdit: (record: MenuItem) => void;
  onDelete: (record: MenuItem) => void;
  onToggleStatus: (record: MenuItem, checked: boolean) => void;
}

export function getMenuColumns(handlers: MenuColumnHandlers): ProColumns<MenuItem>[] {
  const { canUpdate, onAddChild, onEdit, onDelete, onToggleStatus } = handlers;

  return [
    {
      title: '菜单名称',
      dataIndex: 'title',
      width: 220,
      render: (_, record) => (
        <span className='flex-y-center'>
          {record.icon ? <Icon className='text-16px' icon={record.icon} /> : null}
          <span className={record.icon ? 'ms-8px' : undefined}>{record.title}</span>
        </span>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 90,
      search: false,
      valueEnum: {
        directory: { text: '目录' },
        menu: { text: '菜单' }
      },
      render: (_, record) => (record.type === 'directory' ? <Tag color='blue'>目录</Tag> : <Tag color='green'>菜单</Tag>)
    },
    { title: '路由路径', dataIndex: 'path', width: 220, ellipsis: true, search: false },
    { title: '组件路径', dataIndex: 'element', width: 220, ellipsis: true, search: false },
    { title: '图标', dataIndex: 'icon', width: 160, search: false, ellipsis: true },
    { title: '排序', dataIndex: 'sort', width: 80, search: false },
    {
      title: '隐藏',
      dataIndex: 'isHide',
      width: 80,
      search: false,
      render: (_, record) => (record.isHide ? <Tag>是</Tag> : <Tag color='default'>否</Tag>)
    },
    {
      title: '缓存',
      dataIndex: 'isKeepAlive',
      width: 80,
      search: false,
      render: (_, record) => (record.isKeepAlive ? <Tag color='blue'>是</Tag> : <Tag>否</Tag>)
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      valueEnum: STATUS_ENUM,
      render: (_, record) => (
        <Switch disabled={!canUpdate} checked={record.status === 1} onChange={checked => onToggleStatus(record, checked)} />
      )
    },
    {
      title: '操作',
      key: 'option',
      width: 220,
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <>
          <AuthButton authority={MENU_PERMS.CREATE}>
            <Button
              type='link'
              size='small'
              icon={<Icon className='text-14px' icon='ri:add-line' />}
              onClick={() => onAddChild(record)}
            >
              新增
            </Button>
          </AuthButton>
          <AuthButton authority={MENU_PERMS.UPDATE}>
            <Button
              type='link'
              size='small'
              icon={<Icon className='text-14px' icon='ri:edit-line' />}
              onClick={() => onEdit(record)}
            >
              编辑
            </Button>
          </AuthButton>
          <AuthButton authority={MENU_PERMS.DELETE}>
            <Button
              type='link'
              size='small'
              danger
              icon={<Icon className='text-14px' icon='ri:delete-bin-line' />}
              onClick={() => onDelete(record)}
            >
              删除
            </Button>
          </AuthButton>
        </>
      )
    }
  ];
}
