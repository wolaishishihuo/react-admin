import type { TableProps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { Key } from 'react';

import treeExpandIcon from '@/components/TableExpandIcon';

export interface TreeExpandOptions<T> {
  /** false 时空转，满足 hooks 无条件调用 */
  enabled?: boolean;
  /** 默认 'id' */
  rowKey?: keyof T | ((row: T) => Key);
  /** 默认 'children' */
  childrenKey?: string;
  /** 'all' 全展开；1 仅第一层；0 全折叠基线 */
  depth?: number | 'all';
}

export interface TreeExpandResult<T> {
  expandable?: TableProps<T>['expandable'];
  expandedRowKeys: Key[];
  setExpandedRowKeys: (keys: Key[]) => void;
}

/** 树表受控展开种子：数据内容变化重种到 depth 基线；内容未变保留用户折叠。 */
function useTreeExpand<T extends object>(data: T[], options: TreeExpandOptions<T> = {}): TreeExpandResult<T> {
  const { enabled = true } = options;
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!enabled) return;
    const { childrenKey = 'children', depth = 'all', rowKey = 'id' as keyof T } = optionsRef.current;
    const getKey = (row: T): Key => (typeof rowKey === 'function' ? rowKey(row) : (row[rowKey] as Key));
    const maxDepth = depth === 'all' ? Number.POSITIVE_INFINITY : depth;
    const next = collectKeys(data, getKey, childrenKey, maxDepth, 1);
    // 浅比较：内容未变不 setState，防 pending 每帧新数组循环
    setExpandedRowKeys(prev => (prev.length === next.length && next.every((key, i) => key === prev[i]) ? prev : next));
  }, [enabled, data]);

  if (!enabled) return { expandable: undefined, expandedRowKeys: [], setExpandedRowKeys };

  return {
    expandable: {
      expandedRowKeys,
      expandIcon: treeExpandIcon,
      onExpandedRowsChange: keys => setExpandedRowKeys([...keys])
    },
    expandedRowKeys,
    setExpandedRowKeys
  };
}

function collectKeys<T>(rows: T[], getKey: (row: T) => Key, childrenKey: string, maxDepth: number, level: number): Key[] {
  if (level > maxDepth) return [];
  return rows.flatMap(row => {
    const children = (row as Record<string, unknown>)[childrenKey] as T[] | undefined;
    return children?.length ? [getKey(row), ...collectKeys(children, getKey, childrenKey, maxDepth, level + 1)] : [];
  });
}

export default useTreeExpand;
