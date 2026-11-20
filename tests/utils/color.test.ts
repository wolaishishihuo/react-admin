import { describe, expect, it } from 'vitest';

import { convertToSixDigitHexColor, getDarkColor, getLightColor, isHexColor } from '@/utils/color';

describe('color utils', () => {
  it('validates 3-digit and 6-digit hex colors with optional leading hash', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#ffffff')).toBe(true);
    expect(isHexColor('fff')).toBe(true);
    expect(isHexColor('b40006')).toBe(true);
    expect(isHexColor('#ggg')).toBe(false);
    expect(isHexColor('#12345')).toBe(false);
  });

  it('normalizes 3-digit and 6-digit hex colors to uppercase #RRGGBB', () => {
    expect(convertToSixDigitHexColor('#abc')).toBe('#AABBCC');
    expect(convertToSixDigitHexColor('abc')).toBe('#AABBCC');
    expect(convertToSixDigitHexColor('#b40006')).toBe('#B40006');
  });

  it('darkens and lightens hex colors without side effects', () => {
    expect(getDarkColor('#ffffff', 0)).toBe('#ffffff');
    expect(getDarkColor('#ffffff', 0.5)).toBe('#8a8a8a');
    expect(getLightColor('#000000', 0)).toBe('#000000');
    expect(getLightColor('#000000', 0.5)).toBe('#808080');
  });

  it('returns the original input safely when given an invalid hex color', () => {
    expect(getDarkColor('not-a-color', 0.5)).toBe('not-a-color');
    expect(getLightColor('#ggg', 0.5)).toBe('#ggg');
  });
});
