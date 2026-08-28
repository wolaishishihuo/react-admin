import { describe, expect, it } from 'vitest';
import { getParentPaths } from '@/features/navigation/menu-tree';
import type { NavigationItem } from '@/features/navigation/types';

function item(path: string, children: NavigationItem[] = []): NavigationItem {
  return {
    id: path,
    path,
    title: path,
    hidden: false,
    fixed: false,
    permissions: [],
    children
  };
}

describe('getParentPaths', () => {
  it('按 originPath 精确查找父级', () => {
    const tree = [item('/home'), item('/list', [item('/list/useProTable')])];
    expect(getParentPaths(tree, '/list/useProTable')).toEqual(['/list']);
  });
});
