import { Form, Input, InputNumber, Modal, Radio, TreeSelect } from 'antd';

import { MenuItem, ReqCreateMenu } from '@/apis/interface';
import { excludeMenuTree, getMenuTree } from '@/apis/modules/system';

import { formModalClassName, formModalStyles } from '../../formModal';

interface MenuFormModalProps {
  open: boolean;
  saving: boolean;
  current: MenuItem | null;
  initialValues: Partial<MenuItem>;
  onSubmit: (values: ReqCreateMenu) => Promise<void>;
  onCancel: () => void;
}

const MenuFormModal = (props: MenuFormModalProps) => {
  const { open, saving, current, initialValues, onSubmit, onCancel } = props;
  const [form] = Form.useForm<ReqCreateMenu>();
  const menuType = Form.useWatch('type', form);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
  }

  return (
    <Modal
      title={current ? '编辑菜单' : '新增菜单'}
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
      <Form form={form} name='menu-manage-form' layout='vertical' preserve={false} initialValues={initialValues}>
        <Form.Item label='菜单类型' name='type' rules={[{ required: true, message: '请选择菜单类型' }]}>
          <Radio.Group
            optionType='button'
            options={[
              { label: '目录', value: 'directory' },
              { label: '菜单', value: 'menu' }
            ]}
          />
        </Form.Item>
        <Form.Item label='上级菜单' name='parentId'>
          <TreeSelect
            allowClear
            treeDefaultExpandAll
            placeholder='不选则为顶级菜单'
            fieldNames={{ label: 'title', value: 'id', children: 'children' }}
            treeData={excludeMenuTree(getMenuTree(), current?.id)}
          />
        </Form.Item>
        <Form.Item label='菜单名称' name='title' rules={[{ required: true, message: '请输入菜单名称' }]}>
          <Input placeholder='请输入菜单名称' />
        </Form.Item>
        <Form.Item label='路由路径' name='path' rules={[{ required: true, message: '请输入路由路径' }]}>
          <Input placeholder='/system/accountManage' />
        </Form.Item>
        {menuType === 'menu' ? (
          <Form.Item label='组件路径' name='element'>
            <Input placeholder='/system/accountManage/index' />
          </Form.Item>
        ) : null}
        {menuType === 'directory' ? (
          <Form.Item label='重定向' name='redirect'>
            <Input placeholder='/system/accountManage' />
          </Form.Item>
        ) : null}
        <Form.Item label='图标' name='icon'>
          <Input placeholder='ri:settings-line' />
        </Form.Item>
        <Form.Item label='外链地址' name='isLink'>
          <Input placeholder='为空则不是外链' />
        </Form.Item>
        <Form.Item label='排序' name='sort' rules={[{ required: true, message: '请输入排序' }]}>
          <InputNumber min={1} precision={0} className='w-full' />
        </Form.Item>
        <Form.Item label='状态' name='status'>
          <Radio.Group
            options={[
              { label: '启用', value: 1 },
              { label: '停用', value: 0 }
            ]}
          />
        </Form.Item>
        <Form.Item label='是否隐藏' name='isHide'>
          <Radio.Group
            options={[
              { label: '显示', value: false },
              { label: '隐藏', value: true }
            ]}
          />
        </Form.Item>
        <Form.Item label='KeepAlive' name='isKeepAlive'>
          <Radio.Group
            options={[
              { label: '开启', value: true },
              { label: '关闭', value: false }
            ]}
          />
        </Form.Item>
        <Form.Item label='全屏' name='isFull'>
          <Radio.Group
            options={[
              { label: '否', value: false },
              { label: '是', value: true }
            ]}
          />
        </Form.Item>
        <Form.Item label='固定标签' name='isAffix'>
          <Radio.Group
            options={[
              { label: '否', value: false },
              { label: '是', value: true }
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MenuFormModal;
