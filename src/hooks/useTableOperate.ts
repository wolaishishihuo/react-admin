import { useBoolean } from 'ahooks';
import { Form } from 'antd';
import type { TableProps } from 'antd';
import { useState } from 'react';
import type { Key } from 'react';

import { message } from '@/hooks/useMessage';

type OperateType = 'add' | 'edit';
type Refresh = () => void | Promise<void>;
type OperateRow = { id: Key };
type ExecuteResActions<T extends OperateRow> = (res: T, operateType: OperateType, editingData?: T) => void | Promise<void>;

/** 表格操作：新增/编辑弹窗、行选择、删除回调；submitting 接 confirmLoading */
function useTableOperate<T extends OperateRow>(data: T[], refresh: Refresh, executeResActions?: ExecuteResActions<T>) {
  const [modalVisible, { setFalse: closeModal, setTrue: openModal }] = useBoolean();
  const [operateType, setOperateType] = useState<OperateType>('add');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<T>();
  const [editingData, setEditingData] = useState<T>();

  function handleAdd() {
    setOperateType('add');
    setEditingData(undefined);
    form.resetFields();
    openModal();
  }

  /** 编辑：传 ID 时从当前页查找回填，或直接传行对象 */
  function handleEdit(idOrData: T['id'] | T) {
    if (typeof idOrData === 'object') {
      form.setFieldsValue(idOrData as Parameters<typeof form.setFieldsValue>[0]);
      setEditingData(idOrData);
    } else {
      const findItem = data.find(item => item.id === idOrData);
      if (findItem) {
        form.setFieldsValue(findItem as Parameters<typeof form.setFieldsValue>[0]);
        setEditingData(findItem);
      }
    }

    setOperateType('edit');
    openModal();
  }

  const [checkedRowKeys, setCheckedRowKeys] = useState<Key[]>([]);

  function onSelectChange(keys: Key[]) {
    setCheckedRowKeys(keys);
  }

  const rowSelection: TableProps<T>['rowSelection'] = {
    columnWidth: 48,
    fixed: true,
    onChange: onSelectChange,
    selectedRowKeys: checkedRowKeys,
    type: 'checkbox'
  };

  function onClose() {
    closeModal();
    form.resetFields();
    setEditingData(undefined);
  }

  async function onBatchDeleted() {
    message.success('删除成功');
    setCheckedRowKeys([]);
    await refresh();
  }

  async function onDeleted() {
    message.success('删除成功');
    await refresh();
  }

  /** 校验 → 写入 → 分流提示 → 关闭 → 刷新；校验/业务失败保持弹窗 */
  async function handleSubmit() {
    let res: T;

    try {
      res = await form.validateFields();
    } catch {
      return;
    }

    setSubmitting(true);
    try {
      await executeResActions?.(res, operateType, editingData);
    } catch {
      return;
    } finally {
      setSubmitting(false);
    }

    message.success(operateType === 'add' ? '新增成功' : '更新成功');
    onClose();
    await refresh();
  }

  return {
    checkedRowKeys,
    closeModal,
    editingData,
    generalPopupOperation: {
      form,
      handleSubmit,
      onClose,
      open: modalVisible,
      operateType
    },
    handleAdd,
    handleEdit,
    handleSubmit,
    modalVisible,
    onBatchDeleted,
    onDeleted,
    onSelectChange,
    openModal,
    operateType,
    rowSelection,
    submitting
  };
}

export default useTableOperate;
