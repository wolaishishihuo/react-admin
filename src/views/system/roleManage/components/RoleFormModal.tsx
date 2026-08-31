import { Form, Input, Modal, Radio, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type { Key } from 'react';

import { MenuItem, ReqCreateRole, RoleItem } from '@/apis/interface';
import { BUILTIN_ROLE_CODES, getMenuTree } from '@/apis/modules/system';

import { formModalClassName, formModalStyles } from '../../formModal';

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

const RoleFormModal = (props: RoleFormModalProps) => {
  const { open, saving, current, onSubmit, onCancel } = props;
  const [form] = Form.useForm<ReqCreateRole>();
  const isBuiltin = !!current && BUILTIN_ROLE_CODES.includes(current.roleCode);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
  }

  return (
    <Modal
      title={current ? '编辑角色' : '新增角色'}
      open={open}
      confirmLoading={saving}
      width={640}
      centered
      className={formModalClassName}
      destroyOnHidden
      styles={formModalStyles}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form
        form={form}
        name='role-manage-form'
        layout='vertical'
        preserve={false}
        initialValues={current ?? { status: 1, menuIds: [], remark: '' }}
      >
        <Form.Item label='角色名称' name='roleName' rules={[{ required: true, message: '请输入角色名称' }]}>
          <Input placeholder='请输入角色名称' />
        </Form.Item>
        <Form.Item label='角色标识' name='roleCode' rules={[{ required: true, message: '请输入角色标识' }]}>
          <Input placeholder='例如 admin / user' disabled={isBuiltin} />
        </Form.Item>
        <Form.Item label='状态' name='status'>
          <Radio.Group
            options={[
              { label: '启用', value: 1 },
              { label: '停用', value: 0 }
            ]}
          />
        </Form.Item>
        <Form.Item label='备注' name='remark'>
          <Input.TextArea rows={2} placeholder='请输入备注' />
        </Form.Item>
        <Form.Item
          label='菜单权限'
          name='menuIds'
          rules={[{ required: true, type: 'array', min: 1, message: '请选择菜单权限' }]}
          valuePropName='checkedKeys'
          trigger='onCheck'
          getValueFromEvent={menuIdsFromCheck}
        >
          <Tree checkable defaultExpandAll treeData={toTreeData(getMenuTree())} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleFormModal;
