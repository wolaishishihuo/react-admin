import { Icon as IconifyIcon } from '@iconify/react/offline';

interface IconProps {
  /** Remix Icon，如 `ri:home-line`。大小 / 颜色用 className（`text-20px`、`text-icon`） */
  icon: string;
  className?: string;
}

/**
 * 全项目唯一图标入口，对齐 Art Design：`<Icon icon="ri:xxx" />`。
 * 只使用 Remix Icon；数据在 `src/assets/icons/register.ts` 离线注册。
 */
const Icon = (props: IconProps) => {
  const { icon, className } = props;
  if (!icon) return null;
  return <IconifyIcon icon={icon} className={className} width='1em' height='1em' />;
};

export { Icon };
