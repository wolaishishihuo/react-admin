import { beforeEach, describe, expect, it } from 'vitest';

import { fetchGetAccountList } from '@/apis/modules/system';
import { resetSystemMock } from '@/apis/modules/system/mock';
import { formatDataForProTable } from '@/utils';

describe('system mock api', () => {
  beforeEach(() => {
    resetSystemMock();
  });
  it('returns a ResPage that ProTable can consume', async () => {
    const page = await fetchGetAccountList({ current: 2, pageSize: 2, username: '' });

    expect(page.current).toBe(2);
    expect(page.pageSize).toBe(2);
    expect(page.total).toBe(5);
    expect(page.list).toHaveLength(2);
    expect(page.list[0].username).toBe('guest');

    const table = formatDataForProTable(page);
    expect(table).toEqual({
      success: true,
      data: page.list,
      total: 5
    });
  });

  it('filters accounts by username and status', async () => {
    const page = await fetchGetAccountList({ current: 1, pageSize: 10, username: 'tom', status: 0 });
    expect(page.total).toBe(1);
    expect(page.list[0].username).toBe('tom');
  });
});
