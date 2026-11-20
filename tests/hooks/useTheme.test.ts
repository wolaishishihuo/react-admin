import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import useTheme from '@/hooks/useTheme';
import { useGlobalStore } from '@/stores';

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style');
    document.documentElement.classList.remove('dark');
    useGlobalStore.setState({ isDark: true });
  });

  afterEach(() => {
    document.documentElement.removeAttribute('style');
    document.documentElement.classList.remove('dark');
    useGlobalStore.setState({ isDark: false });
  });

  it('clears the pre-hydration inline background from index.html and updates CSS theme variables', () => {
    document.documentElement.style.background = '#141414';

    renderHook(() => useTheme());

    expect(document.documentElement.style.background).toBe('');
    expect(document.documentElement.style.backgroundColor).toBe('');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--hooks-colorBgContent')).toBe('#070707');

    act(() => {
      useGlobalStore.setState({ isDark: false });
    });

    expect(document.documentElement.style.background).toBe('');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.getPropertyValue('--hooks-colorBgContent')).toBe('#fafbfc');
  });
});
