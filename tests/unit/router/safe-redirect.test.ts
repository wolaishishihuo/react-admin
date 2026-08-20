import { describe, expect, it } from 'vitest';
import { isSafeRedirect } from '@/router/safe-redirect';

describe('isSafeRedirect', () => {
  it('接受站内路径和 query', () => {
    expect(isSafeRedirect('/a?x=1')).toBe(true);
    expect(isSafeRedirect('/list/useProTable/detail?id=1')).toBe(true);
    expect(isSafeRedirect('/home')).toBe(true);
  });

  it('拒绝协议相对、协议 URL、反斜杠和空值', () => {
    expect(isSafeRedirect('//host')).toBe(false);
    expect(isSafeRedirect('//evil.example/phish')).toBe(false);
    expect(isSafeRedirect('http://evil.example')).toBe(false);
    expect(isSafeRedirect('https://evil.example')).toBe(false);
    expect(isSafeRedirect('/\\evil')).toBe(false);
    expect(isSafeRedirect('')).toBe(false);
    expect(isSafeRedirect(null)).toBe(false);
    expect(isSafeRedirect(undefined)).toBe(false);
  });

  it('拒绝控制字符', () => {
    expect(isSafeRedirect('/home\u0000')).toBe(false);
    expect(isSafeRedirect('/home\n')).toBe(false);
  });
});
