import { memo, type ReactNode } from 'react';

import useAuthButton from '@/hooks/useAuthButton';

interface AuthButtonProps {
  /** 按钮权限码，数组为 AND */
  authority: string | string[];
  children: ReactNode;
}

const AuthButton = (props: AuthButtonProps) => {
  const { authority, children } = props;
  const { hasPerm } = useAuthButton();

  if (!hasPerm(authority)) return null;
  return children;
};

export default memo(AuthButton);
