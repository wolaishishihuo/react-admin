import { Icon as IconifyIcon } from '@iconify/react/offline';

interface IconProps {
  /** Remix Icon，如 `ri:home-line`。大小 / 颜色用 className（`text-18px`、`text-icon`） */
  icon: string;
  className?: string;
}

/** `<Icon icon="ri:xxx" className="text-18px" />` */
const Icon = (props: IconProps) => {
  const { icon, className } = props;
  if (!icon) return null;
  return <IconifyIcon icon={icon} className={className} width='1em' height='1em' />;
};

export { Icon };
