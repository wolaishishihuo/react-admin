import { describe, expect, it, vi } from 'vitest';
import { isHttpUrl, openExternal } from '@/utils/url';

describe('isHttpUrl', () => {
  it('接受 http 与 https', () => {
    expect(isHttpUrl('http://example.com')).toBe(true);
    expect(isHttpUrl('https://example.com')).toBe(true);
    expect(isHttpUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('拒绝非 http(s) 与站内路径', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,hi')).toBe(false);
    expect(isHttpUrl('ftp://example.com')).toBe(false);
    expect(isHttpUrl('//example.com')).toBe(false);
    expect(isHttpUrl('/list/useProTable')).toBe(false);
    expect(isHttpUrl('example.com')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
    expect(isHttpUrl(undefined)).toBe(false);
  });
});

describe('openExternal', () => {
  it('使用 noopener,noreferrer 打开新窗口', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    openExternal('https://example.com');
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    open.mockRestore();
  });
});
