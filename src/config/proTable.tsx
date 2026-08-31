import type { TablePaginationConfig, TableProps } from 'antd';

import { Icon } from '@/components/Icon';

export const pagination: TablePaginationConfig = {
  size: 'middle',
  showSizeChanger: true,
  defaultPageSize: 10
};

type TableExpandIcon = NonNullable<NonNullable<TableProps['expandable']>['expandIcon']>;

/** 树形 / 可展开表格：用箭头替代默认的加减号方框 */
export const tableExpandIcon: TableExpandIcon = props => {
  const { prefixCls, expanded, expandable, record, onExpand } = props;
  const iconPrefix = `${prefixCls}-row-expand-icon`;

  if (!expandable) {
    return <button type='button' className={`${iconPrefix}  ${iconPrefix}-spaced`} aria-hidden tabIndex={-1} />;
  }

  return (
    <button
      type='button'
      className={`${iconPrefix}  ${expanded ? `${iconPrefix}-expanded` : `${iconPrefix}-collapsed`}`}
      aria-label={expanded ? '收起' : '展开'}
      aria-expanded={expanded}
      onClick={event => {
        onExpand(record, event);
        event.stopPropagation();
      }}
    >
      <Icon
        icon='ri:arrow-right-s-line'
        className={`text-16px transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
      />
    </button>
  );
};

export const tableConfig = {
  expandable: { expandIcon: tableExpandIcon }
};
