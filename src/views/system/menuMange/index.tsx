import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useRef, useState } from 'react';

import { MenuItem, ReqCreateMenu, ReqMenuList } from '@/apis/interface';
import { fetchCreateMenu, fetchDeleteMenu, fetchGetMenuList, fetchUpdateMenu, findMenu } from '@/apis/modules/system';
import { Icon } from '@/components/Icon';
import { message, modal } from '@/hooks/useMessage';
import { formatDataForProTable } from '@/utils';

import MenuFormModal from './components/MenuFormModal';
import { getMenuColumns } from './config/columns';

const defaultFormValues: Partial<MenuItem> = {
  type: 'menu',
  status: 1,
  sort: 1,
  isHide: false,
  isFull: false,
  isAffix: false,
  isKeepAlive: true,
  isLink: '',
  parentId: ''
};

const MenuMange = () => {
  const actionRef = useRef<ActionType>(undefined);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<MenuItem | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<MenuItem>>(defaultFormValues);

  function reload() {
    actionRef.current?.reload();
  }

  function openModal(record?: Partial<MenuItem>) {
    setCurrent(record?.id ? findMenu(record.id) || null : null);
    setInitialValues({ ...defaultFormValues, ...record });
    setOpen(true);
  }

  async function handleSubmit(values: ReqCreateMenu) {
    setSaving(true);
    try {
      if (current) await fetchUpdateMenu({ ...current, ...values });
      else await fetchCreateMenu(values);
      setOpen(false);
      message.success(current ? '编辑菜单成功' : '新增菜单成功');
      reload();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(record: MenuItem) {
    modal.confirm({
      title: '温馨提示',
      content: record.children?.length
        ? `删除「${record.title}」将同时删除其子菜单，是否继续？`
        : `确认删除菜单「${record.title}」？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        await fetchDeleteMenu(record.id);
        message.success('删除成功');
        reload();
      }
    });
  }

  async function handleToggleStatus(record: MenuItem, checked: boolean) {
    await fetchUpdateMenu({ ...record, status: checked ? 1 : 0 });
    reload();
  }

  async function requestMenus(params: ReqMenuList) {
    return formatDataForProTable(await fetchGetMenuList(params));
  }

  const columns = getMenuColumns({
    onAddChild: record => openModal({ parentId: record.id, type: 'menu' }),
    onEdit: openModal,
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus
  });

  return (
    <>
      <ProTable<MenuItem>
        className='ant-pro-table-scroll'
        columns={columns}
        actionRef={actionRef}
        bordered
        cardBordered
        rowKey='id'
        pagination={false}
        scroll={{ x: 1400, y: '100%' }}
        search={{ labelWidth: 'auto' }}
        form={{ name: 'menu-manage-search' }}
        expandable={{ defaultExpandAllRows: true }}
        request={requestMenus}
        toolBarRender={() => [
          <Button key='add' type='primary' icon={<Icon icon='ri:add-line' />} onClick={() => openModal()}>
            新增菜单
          </Button>
        ]}
      />
      <MenuFormModal
        open={open}
        saving={saving}
        current={current}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
      />
    </>
  );
};

export default MenuMange;
