import { Icon as SvgIcon } from '@iconify/react/offline';
import type { TableProps } from 'antd';
import clsx from 'clsx';

type TreeExpandIconProps<T extends object> = Parameters<NonNullable<NonNullable<TableProps<T>['expandable']>['expandIcon']>>[0];

/** 树表展开图标：右箭头，展开旋转 90°；空 children:[] 视为叶子 */
function treeExpandIcon<T extends object>({ expanded, onExpand, record, expandable }: TreeExpandIconProps<T>) {
  const children = (record as { children?: unknown[] })?.children;
  const showArrow = expandable && children?.length !== 0;

  if (!showArrow) {
    return <span className='mr-1 w-4 inline-block' />;
  }

  return (
    <span
      className='text-icon mr-1 align-middle inline-flex w-4 cursor-pointer hover:text-content'
      onClick={e => onExpand(record, e)}
    >
      <SvgIcon
        icon='ri:arrow-right-s-line'
        className={clsx('text-16px transition-transform duration-200', expanded && 'rotate-90')}
      />
    </span>
  );
}

export default treeExpandIcon;
