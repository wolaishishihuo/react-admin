import { Col, Form, Input, Modal, Row, Switch, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { type Key, useEffect } from 'react';

import { MenuItem, ReqCreateRole, RoleItem } from '@/apis/interface';
import { BUILTIN_ROLE_CODES, getMenuTree } from '@/apis/modules/system';

import { enableStatusSwitchProps, formModalClassName, formModalStyles, formModalWidth } from '../../formModal';

interface RoleFormModalProps {
  open: boolean;
  saving: boolean;
  current: RoleItem | null;
  onSubmit: (values: ReqCreateRole) => Promise<void>;
  onCancel: () => void;
}

function toTreeData(tree: MenuItem[]): DataNode[] {
  return tree.map(item => ({
    key: item.id,
    title: item.title,
    children: item.children?.length ? toTreeData(item.children) : undefined
  }));
}

function menuIdsFromCheck(checked: Key[] | { checked: Key[]; halfChecked: Key[] }) {
  const keys = Array.isArray(checked) ? checked : checked.checked;
  return keys.map(String);
}

interface RoleMenuTreeProps {
  value?: string[];
  onChange?: (ids: string[]) => void;
}

const RoleMenuTree = (props: RoleMenuTreeProps) => {
  const { value, onChange } = props;

  return (
    <Tree
      className='system-form-tree'
      checkable
      blockNode
      defaultExpandAll
      checkedKeys={value}
      treeData={toTreeData(getMenuTree())}
      onCheck={checked => onChange?.(menuIdsFromCheck(checked))}
    />
  );
};

const emptyRole: ReqCreateRole = { roleName: '', roleCode: '', status: 1, menuIds: [], remark: '' };

const RoleFormModal = (props: RoleFormModalProps) => {
  const { open, saving, current, onSubmit, onCancel } = props;
  const [form] = Form.useForm<ReqCreateRole>();
  const isBuiltin = !!current && BUILTIN_ROLE_CODES.includes(current.roleCode);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
  }

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(current ?? emptyRole);
  }, [open, current]);

  return (
    <Modal
      title={current ? '编辑角色' : '新增角色'}
      open={open}
      confirmLoading={saving}
      width={formModalWidth.role}
      centered
      className={formModalClassName}
      destroyOnHidden
      styles={formModalStyles}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form form={form} name='role-manage-form' layout='vertical' preserve={false} initialValues={emptyRole}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='角色名称' name='roleName' rules={[{ required: true, message: '请输入角色名称' }]}>
              <Input placeholder='请输入角色名称' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='角色标识' name='roleCode' rules={[{ required: true, message: '请输入角色标识' }]}>
              <Input placeholder='例如 admin / user' disabled={isBuiltin} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item label='备注' name='remark'>
              <Input.TextArea rows={1} placeholder='请输入备注' />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label='状态' name='status' {...enableStatusSwitchProps}>
              <Switch size='small' />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          className='mb-0'
          label='菜单权限'
          name='menuIds'
          rules={[{ required: true, type: 'array', min: 1, message: '请选择菜单权限' }]}
        >
          <RoleMenuTree />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
