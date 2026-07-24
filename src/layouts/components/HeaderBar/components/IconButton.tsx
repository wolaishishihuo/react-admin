import { Icon } from '@iconify/react/offline';
import type React from 'react';

interface IconButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: string;
  ref?: React.Ref<HTMLDivElement>;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, className = '', children, ref, ...rest }) => {
  return (
    <div ref={ref} className={`icon-btn ${className}`} {...rest}>
      <Icon icon={icon} />
      {children}
    </div>
  );
};

export default IconButton;
