import { describe, expect, it } from 'vitest';

import type { RouteObjectType } from '@/routers/interface';
import { findMenuBranch } from '@/utils';

const sampleMenus: RouteObjectType[] = [
  {
    path: '/home/index',
    meta: { title: '首页' }
  },
  {
    path: '/ops',
    meta: { title: '运维中心' },
    children: [
      {
        path: '/audit',
        meta: { title: '审计管理' },
        children: [
          {
            path: '/system/log',
            meta: { title: '操作日志' }
          },
          {
            path: '/system/logDetail',
            meta: { title: '日志详情', isHide: true }
          }
        ]
      }
    ]
  },
  {
    path: '/system',
    meta: { title: '系统管理' },
    children: [
      {
        path: '/system/accountManage',
        meta: { title: '账号管理' }
      }
    ]
  }
];

describe('findMenuBranch', () => {
  it('finds full ancestor chain for non-prefix multi-level menus without relying on meta.key', () => {
    const branch = findMenuBranch(sampleMenus, '/system/log');
    expect(branch.map(item => item.path)).toEqual(['/ops', '/audit', '/system/log']);
  });

  it('finds hidden child menus inside authMenuList so sidebars stay visible', () => {
    const branch = findMenuBranch(sampleMenus, '/system/logDetail');
    expect(branch.map(item => item.path)).toEqual(['/ops', '/audit', '/system/logDetail']);
  });

  it('falls back to first path segment for unlisted dynamic sub-routes', () => {
    const branch = findMenuBranch(sampleMenus, '/system/custom/123');
    expect(branch.map(item => item.path)).toEqual(['/system']);
  });

  it('returns empty array when neither exact path nor top segment matches', () => {
    expect(findMenuBranch(sampleMenus, '/unknown/page')).toEqual([]);
  });
});
