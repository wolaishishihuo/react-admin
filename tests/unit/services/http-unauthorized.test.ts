import { describe, expect, it, vi } from 'vitest';
import { expireSession, registerUnauthorizedHandler } from '@/services/http/unauthorized';

describe('expireSession', () => {
  it('并发 401 只执行一次 handler', async () => {
    const handler = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });
    registerUnauthorizedHandler(handler);
    await Promise.all([expireSession(), expireSession(), expireSession()]);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
