import './form-modal.less';

import type { CSSProperties } from 'react';

import type { EnableStatus } from '@/apis/interface';

export const formModalClassName = 'system-form-modal';

export const formModalWidth = {
  account: 720,
  role: 760,
  menu: 800
} as const;

export const formModalStyles: { body: CSSProperties } = {
  body: { overflow: 'hidden' }
};

/** 启用 / 停用：表里是 1 | 0，开关是 boolean */
export const enableStatusSwitchProps = {
  valuePropName: 'checked' as const,
  getValueFromEvent: (checked: boolean): EnableStatus => (checked ? 1 : 0),
  getValueProps: (value: EnableStatus | undefined) => ({ checked: value === 1 })
};

/** 开关开 = 显示，写入 isHide = false */
export const visibleSwitchProps = {
  valuePropName: 'checked' as const,
  getValueFromEvent: (checked: boolean) => !checked,
  getValueProps: (value: boolean | undefined) => ({ checked: !value })
};
