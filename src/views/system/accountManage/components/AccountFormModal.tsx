import { Form, Input, Modal, Radio, Select } from 'antd';

import { AccountItem } from '@/apis/interface';
import { BUILTIN_USERNAMES, getRoles } from '@/apis/modules/system';

import { formModalClassName, formModalStyles } from '../../formModal';

export type AccountFormValues = Omit<AccountItem, 'id' | 'createTime'> & { password?: string };

interface AccountFormModalProps {
  open: boolean;
  saving: boolean;
  current: AccountItem | null;
  onSubmit: (values: AccountFormValues) => Promise<void>;
  onCancel: () => void;
}

const AccountFormModal = (props: AccountFormModalProps) => {
  const { open, saving, current, onSubmit, onCancel } = props;
  const [form] = Form.useForm<AccountFormValues>();
  const roleOptions = getRoles().map(item => ({ label: item.roleName, value: item.id }));
  const isBuiltin = !!current && BUILTIN_USERNAMES.includes(current.username);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
  }

  return (
    <Modal
      title={current ? '编辑账号' : '新增账号'}
      open={open}
      confirmLoading={saving}
      width={560}
      centered
      className={formModalClassName}
      destroyOnHidden
      styles={formModalStyles}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form
        form={form}
        name='account-manage-form'
        layout='vertical'
        preserve={false}
        initialValues={
          current ?? {
            gender: 1,
            status: 1,
            roleIds: [],
            remark: '',
            password: '123456'
          }
        }
      >
        <Form.Item label='用户名' name='username' rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder='请输入用户名' disabled={isBuiltin} />
        </Form.Item>
        {!current && (
          <Form.Item label='密码' name='password' rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder='默认 123456' />
          </Form.Item>
        )}
        <Form.Item label='昵称' name='nickName' rules={[{ required: true, message: '请输入昵称' }]}>
          <Input placeholder='请输入昵称' />
        </Form.Item>
        <Form.Item label='性别' name='gender'>
          <Radio.Group
            options={[
              { label: '男', value: 1 },
              { label: '女', value: 2 }
            ]}
          />
        </Form.Item>
        <Form.Item label='手机号' name='phone' rules={[{ required: true, message: '请输入手机号' }]}>
          <Input placeholder='请输入手机号' />
        </Form.Item>
        <Form.Item label='邮箱' name='email' rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
          <Input placeholder='请输入邮箱' />
        </Form.Item>
        <Form.Item label='角色' name='roleIds' rules={[{ required: true, type: 'array', min: 1, message: '请选择角色' }]}>
          <Select mode='multiple' placeholder='请选择角色' options={roleOptions} />
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
      </Form>
    </Modal>
  );
};

export default AccountFormModal;
