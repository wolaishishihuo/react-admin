import { describe, expect, it } from 'vitest';

import { isArray, isDef, isFunction, isHexColor, isNull, isObject, isString, isUnDef } from '@/utils/is';

describe('is', () => {
  it('identifies functions and strings', () => {
    expect(isFunction(() => undefined)).toBe(true);
    expect(isFunction({})).toBe(false);
    expect(isString('a')).toBe(true);
    expect(isString(1)).toBe(false);
  });

  it('identifies defined vs undefined and null', () => {
    expect(isDef(0)).toBe(true);
    expect(isUnDef(undefined)).toBe(true);
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
  });

  it('identifies objects and arrays', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isArray([1])).toBe(true);
    expect(isArray({})).toBe(false);
  });

  it('identifies hex colors', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#ffffff')).toBe(true);
    expect(isHexColor('fff')).toBe(true);
    expect(isHexColor('#ggg')).toBe(false);
  });
});
