import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import useAuthButton from '@/hooks/useAuthButton';
import { useAuthStore } from '@/stores';

describe('useAuthButton', () => {
  afterEach(() => {
    useAuthStore.setState({ authButtons: [] });
  });

  it('hasPerm reads the flat authButtons list', () => {
    useAuthStore.setState({ authButtons: ['sys:user:create', 'sys:user:update'] });
    const { result } = renderHook(() => useAuthButton());

    expect(result.current.hasPerm('sys:user:create')).toBe(true);
    expect(result.current.hasPerm('sys:user:delete')).toBe(false);
  });

  it('hasPerm treats an array as AND', () => {
    useAuthStore.setState({ authButtons: ['sys:user:create'] });
    const missing = renderHook(() => useAuthButton());
    expect(missing.result.current.hasPerm(['sys:user:create', 'sys:user:update'])).toBe(false);

    useAuthStore.setState({ authButtons: ['sys:user:create', 'sys:user:update'] });
    const granted = renderHook(() => useAuthButton());
    expect(granted.result.current.hasPerm(['sys:user:create', 'sys:user:update'])).toBe(true);
  });

  it('hasPerm is false for an empty code list', () => {
    useAuthStore.setState({ authButtons: ['sys:user:create'] });
    const { result } = renderHook(() => useAuthButton());

    expect(result.current.hasPerm([])).toBe(false);
  });
});
