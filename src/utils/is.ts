/** 判断值是否为指定类型 */
export function is(val: unknown, type: string) {
  return Object.prototype.toString.call(val) === `[object ${type}]`;
}

/** 是否为函数 */
export function isFunction<T = Function>(val: unknown): val is T {
  return is(val, 'Function');
}

/** 是否已定义 */
export const isDef = <T = unknown>(val?: T): val is T => {
  return typeof val !== 'undefined';
};

/** 是否为 undefined */
export const isUnDef = <T = unknown>(val?: T): val is T => {
  return !isDef(val);
};

/** 是否为对象 */
export const isObject = (val: any): val is Record<any, any> => {
  return val !== null && is(val, 'Object');
};

/** 是否为日期 */
export function isDate(val: unknown): val is Date {
  return is(val, 'Date');
}

/** 是否为数字 */
export function isNumber(val: unknown): val is number {
  return is(val, 'Number');
}

/** 是否为 AsyncFunction */
export function isAsyncFunction<T = any>(val: unknown): val is Promise<T> {
  return is(val, 'AsyncFunction');
}

/** 是否为 Promise */
export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

/** 是否为字符串 */
export function isString(val: unknown): val is string {
  return is(val, 'String');
}

/** 是否为布尔类型 */
export function isBoolean(val: unknown): val is boolean {
  return is(val, 'Boolean');
}

/** 是否为数组 */
export function isArray(val: any): val is Array<any> {
  return val && Array.isArray(val);
}

/** 是否为客户端环境 */
export const isClient = () => {
  return typeof window !== 'undefined';
};

/** 是否为浏览器 Window */
export const isWindow = (val: any): val is Window => {
  return typeof window !== 'undefined' && is(val, 'Window');
};

/** 是否为 DOM 元素 */
export const isElement = (val: unknown): val is Element => {
  return isObject(val) && !!val.tagName;
};

/** 是否为 null */
export function isNull(val: unknown): val is null {
  return val === null;
}

/** 是否为 null 或 undefined */
export function isNullOrUnDef(val: unknown): val is null | undefined {
  return isUnDef(val) || isNull(val);
}

/** 是否为安全的站内跳转地址（挡掉 //evil.com 这类协议相对外链） */
export function isSafeRedirect(val?: string | null): val is string {
  return !!val && val.startsWith('/') && !val.startsWith('//');
}

/** 是否为十六进制颜色值 */
export const isHexColor = (str: string) => {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
};
