import type { HTMLAttributes } from 'react';

import { Icon } from '@/components/Icon';

interface IconButtonProps extends HTMLAttributes<HTMLDivElement> {
  /** Remix Icon 名，如 `ri:search-line` */
  icon: string;
}

const IconButton = (props: IconButtonProps) => {
  const { icon, className = '', children, ...rest } = props;

  return (
    <div className={`icon-btn ${className}`.trim()} {...rest}>
      <Icon icon={icon} />
      {children}
    </div>
  );
};

export default IconButton;
