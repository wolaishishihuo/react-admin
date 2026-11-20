import { afterEach, describe, expect, it, vi } from 'vitest';

import { getStorageKey } from '@/config';
import { useGlobalStore, useTabsStore, useUserStore } from '@/stores';

describe('getStorageKey', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefixes keys with VITE_STORAGE_PREFIX and trims whitespace', () => {
    vi.stubEnv('VITE_STORAGE_PREFIX', '  crm-admin  ');
    expect(getStorageKey('tabs')).toBe('crm-admin:tabs');
  });

  it('falls back to react-admin when VITE_STORAGE_PREFIX is empty', () => {
    vi.stubEnv('VITE_STORAGE_PREFIX', '   ');
    expect(getStorageKey('tabs')).toBe('react-admin:tabs');
  });

  it('applies the configured prefix to all persisted stores', () => {
    expect(useTabsStore.persist.getOptions().name).toBe('react-admin:tabs');
    expect(useGlobalStore.persist.getOptions().name).toBe('react-admin:global');
    expect(useUserStore.persist.getOptions().name).toBe('react-admin:user');
  });
});
