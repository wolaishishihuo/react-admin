import { type RefObject } from 'react';
import { type KeepAliveRef } from 'keepalive-for-react';

/** 模块级 KeepAlive ref；LayoutMain 注入，供组件外刷新/销毁缓存 */
let aliveRef: RefObject<KeepAliveRef | null> | null = null;

export const setKeepAliveRef = (ref: RefObject<KeepAliveRef | null> | null) => {
  aliveRef = ref;
};

/** 刷新缓存页（不传 = 当前活跃页） */
export const refreshKeepAlive = (cacheKey?: string) => aliveRef?.current?.refresh(cacheKey);

/** 销毁缓存页（空数组 = 空操作；不传 = 当前活跃页） */
export const destroyKeepAlive = (cacheKey?: string | string[]) => aliveRef?.current?.destroy(cacheKey);
