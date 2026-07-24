import React from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';

interface IconProps {
  name: string;
  className?: string;
}

/** 按名渲染 iconify 图标（动态字符串场景） */
export const Icon: React.FC<IconProps> = React.memo(({ name, className }) => {
  if (!name) return null;
  return <IconifyIcon icon={name} className={className} />;
});
