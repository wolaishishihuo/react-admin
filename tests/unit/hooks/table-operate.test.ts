import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { registerFeedback } from '@/app/feedback';
import useTableOperate from '@/hooks/useTableOperate';

const feedback = {
  success: vi.fn(),
  error: vi.fn(),
  open: vi.fn(),
  destroy: vi.fn()
};

registerFeedback({
  message: feedback as never,
  notification: {} as never,
  modal: {} as never
});

describe('useTableOperate', () => {
  type Row = { id: string; name?: string };

  it('新增打开弹窗，编辑回填行', () => {
    const refresh = vi.fn();
    const rows: Row[] = [{ id: '1', name: 'n1' }];
    const { result } = renderHook(() => useTableOperate(rows, refresh));

    act(() => result.current.handleAdd());
    expect(result.current.operateType).toBe('add');
    expect(result.current.modalVisible).toBe(true);

    act(() => result.current.handleEdit(rows[0]));
    expect(result.current.operateType).toBe('edit');
    expect(result.current.editingData).toEqual(rows[0]);
  });

  it('校验失败保持弹窗且不提交', async () => {
    const refresh = vi.fn();
    const execute = vi.fn();
    const { result } = renderHook(() => useTableOperate<Row>([{ id: '1' }], refresh, execute));
    act(() => result.current.handleAdd());
    vi.spyOn(result.current.generalPopupOperation.form, 'validateFields').mockRejectedValueOnce({ errorFields: [] });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.modalVisible).toBe(true);
    expect(execute).not.toHaveBeenCalled();
    expect(result.current.submitting).toBe(false);
  });

  it('提交中 submitting 为 true，业务失败保持弹窗', async () => {
    const refresh = vi.fn();
    let release!: (error?: unknown) => void;
    const execute = vi.fn(
      () =>
        new Promise<void>((resolve, reject) => {
          release = error => (error ? reject(error) : resolve());
        })
    );
    const { result } = renderHook(() => useTableOperate<Row>([{ id: '1' }], refresh, execute));
    act(() => result.current.handleAdd());
    vi.spyOn(result.current.generalPopupOperation.form, 'validateFields').mockResolvedValue({ id: '2', name: 'n2' });

    const pending = result.current.handleSubmit();
    await waitFor(() => {
      expect(result.current.submitting).toBe(true);
    });

    await act(async () => {
      release(new Error('业务失败'));
      await pending;
    });
    expect(result.current.submitting).toBe(false);
    expect(result.current.modalVisible).toBe(true);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('成功关闭弹窗并刷新', async () => {
    const refresh = vi.fn();
    const execute = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useTableOperate<Row>([{ id: '1' }], refresh, execute));
    act(() => result.current.handleAdd());
    vi.spyOn(result.current.generalPopupOperation.form, 'validateFields').mockResolvedValue({ id: '2', name: 'n2' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.modalVisible).toBe(false);
    expect(refresh).toHaveBeenCalled();
    expect(execute).toHaveBeenCalled();
  });
});
