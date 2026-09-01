import { describe, expect, it } from 'vitest';

import { fetchGetCurrentUser } from '@/apis/modules/user';

describe('fetchGetCurrentUser', () => {
  it('returns a flat buttons array', async () => {
    const me = await fetchGetCurrentUser();

    expect(Array.isArray(me.buttons)).toBe(true);
    expect(me.buttons).toContain('sys:user:create');
  });
});
