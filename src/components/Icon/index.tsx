import { createFromIconfontCN } from '@ant-design/icons';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const legacyIconMap: Record<string, string> = {
  HomeOutlined: 'ri:home-smile-2-line',
  SettingOutlined: 'ri:settings-3-line',
  AppstoreOutlined: 'ri:apps-line'
};

/** 按名渲染 iconify 图标（动态字符串场景） */
export const Icon: React.FC<IconProps> = React.memo(({ name, className }) => {
  if (!name) return null;
  return <IconifyIcon icon={legacyIconMap[name] ?? name} className={className} />;
});

export const IconFont = createFromIconfontCN({
  scriptUrl: ['//at.alicdn.com/t/c/font_3878708_l04g6iwc6y.js']
});
