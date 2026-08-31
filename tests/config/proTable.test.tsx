import '@/assets/icons/register';

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { tableExpandIcon } from '@/config/proTable';

const baseProps = {
  prefixCls: 'ant-table',
  record: { id: 'home' }
};

afterEach(cleanup);

describe('tableExpandIcon', () => {
  it('renders a collapsed arrow that rotates when expanded', () => {
    const { rerender } = render(tableExpandIcon({ ...baseProps, expanded: false, expandable: true, onExpand: vi.fn() }));

    const button = screen.getByRole('button', { name: '展开' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button.querySelector('.rotate-90')).toBeNull();

    rerender(tableExpandIcon({ ...baseProps, expanded: true, expandable: true, onExpand: vi.fn() }));
    expect(screen.getByRole('button', { name: '收起' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: '收起' }).querySelector('.rotate-90')).not.toBeNull();
  });

  it('keeps leaf-row spacing without an arrow', () => {
    const { container } = render(tableExpandIcon({ ...baseProps, expanded: false, expandable: false, onExpand: vi.fn() }));

    expect(container.querySelector('.ant-table-row-expand-icon-spaced')).not.toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('notifies the table when the arrow is clicked', async () => {
    const onExpand = vi.fn();
    const user = userEvent.setup();
    render(tableExpandIcon({ ...baseProps, expanded: false, expandable: true, onExpand }));

    await user.click(screen.getByRole('button', { name: '展开' }));
    expect(onExpand).toHaveBeenCalledWith(baseProps.record, expect.any(Object));
  });
});
