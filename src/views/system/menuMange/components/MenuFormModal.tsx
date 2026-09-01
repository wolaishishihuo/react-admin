import { Col, Form, Input, InputNumber, Modal, Row, Segmented, Switch, TreeSelect } from 'antd';
import { useEffect } from 'react';

import { MenuItem, ReqCreateMenu } from '@/apis/interface';
import { excludeMenuTree, getMenuTree } from '@/apis/modules/system';
import { Icon } from '@/components/Icon';

import FormFlag from '../../components/FormFlag';
import {
  enableStatusSwitchProps,
  formModalClassName,
  formModalStyles,
  formModalWidth,
  visibleSwitchProps
} from '../../formModal';

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
  const icon = Form.useWatch('icon', form);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
  }

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(initialValues);
  }, [open, initialValues]);

  return (
    <Modal
      title={current ? '编辑菜单' : '新增菜单'}
      open={open}
      confirmLoading={saving}
      width={formModalWidth.menu}
      centered
      className={formModalClassName}
      destroyOnHidden
      styles={formModalStyles}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form form={form} name='menu-manage-form' layout='vertical' preserve={false} initialValues={initialValues}>
        <Form.Item label='菜单类型' name='type' rules={[{ required: true, message: '请选择菜单类型' }]}>
          <Segmented
            block
            options={[
              { label: '目录', value: 'directory' },
              { label: '菜单', value: 'menu' }
            ]}
          />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='上级菜单' name='parentId'>
              <TreeSelect
                allowClear
                treeDefaultExpandAll
                placeholder='不选则为顶级菜单'
                fieldNames={{ label: 'title', value: 'id', children: 'children' }}
                treeData={excludeMenuTree(getMenuTree(), current?.id)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='菜单名称' name='title' rules={[{ required: true, message: '请输入菜单名称' }]}>
              <Input placeholder='请输入菜单名称' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='路由路径' name='path' rules={[{ required: true, message: '请输入路由路径' }]}>
              <Input placeholder='/system/accountManage' />
            </Form.Item>
          </Col>
          <Col span={12}>
            {menuType === 'menu' ? (
              <Form.Item label='组件路径' name='element'>
                <Input placeholder='/system/accountManage/index' />
              </Form.Item>
            ) : (
              <Form.Item label='重定向' name='redirect'>
                <Input placeholder='/system/accountManage' />
              </Form.Item>
            )}
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='图标' name='icon'>
              <Input
                placeholder='ri:settings-line'
                prefix={
                  <Icon className={icon ? 'text-16px' : 'text-16px text-content-pale'} icon={icon || 'ri:remixicon-line'} />
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='外链地址' name='isLink'>
              <Input placeholder='为空则不是外链' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='排序' name='sort' rules={[{ required: true, message: '请输入排序' }]}>
              <InputNumber min={1} precision={0} className='w-full' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='状态' name='status' {...enableStatusSwitchProps}>
              <Switch size='small' />
            </Form.Item>
          </Col>
        </Row>
        <div className='system-form-section'>显示设置</div>
        <div className='system-form-flags'>
          <FormFlag name='isHide' label='在菜单中显示' itemProps={visibleSwitchProps} />
          <FormFlag name='isKeepAlive' label='页面缓存' />
          <FormFlag name='isFull' label='全屏打开' />
          <FormFlag name='isAffix' label='固定标签' />
        </div>
      </Form>
    </Modal>
  );
};

export default MenuFormModal;
