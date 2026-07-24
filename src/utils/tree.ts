import type { Key } from 'react';

/** 树节点最小结构约束（供泛型工具函数复用） */
export interface TreeNode {
  id?: string;
  children?: TreeNode[];
}

/** 递归收集有子级的节点 id（树表受控全展开用；defaultExpandAllRows 对异步数据不生效） */
export function collectExpandableKeys(tree: TreeNode[]): Key[] {
  return tree.flatMap(node => (node.children?.length ? [node.id as Key, ...collectExpandableKeys(node.children)] : []));
}

/** 从树中排除指定节点及其子孙（编辑时上级选择器防成环）；id 为空返回原树 */
export function excludeSubtree<T extends TreeNode>(tree: T[], id?: string): T[] {
  if (!id) return tree;
  return tree
    .filter(node => node.id !== id)
    .map(node => (node.children?.length ? { ...node, children: excludeSubtree(node.children, id) } : node));
}

/** 递归剥掉空 children 数组（后端叶子返回 []，antd 树表会误显展开箭头） */
export function pruneEmptyChildren<T extends TreeNode>(tree: T[]): T[] {
  return tree.map(node =>
    node.children?.length ? { ...node, children: pruneEmptyChildren(node.children) } : { ...node, children: undefined }
  );
}
