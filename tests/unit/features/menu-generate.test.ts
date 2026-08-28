import { describe, expect, it } from 'vitest';
import { generateStaticNavigation } from '@/features/navigation/menu-generate';
import type { AnyRouter } from '@tanstack/react-router';

function router(tree: unknown) {
  return { routeTree: tree } as AnyRouter;
}

describe('generateStaticNavigation', () => {
  it('从 (admin) route tree 生成菜单，隐藏项进入 pathMap 但不出现在可见树', () => {
    const navigation = generateStaticNavigation(
      router({
        id: '__root__',
        fullPath: '/',
        children: [
          {
            id: '/(admin)',
            children: [
              {
                fullPath: '/home/',
                staticData: { title: '首页', menu: { icon: 'ri:home-smile-2-line', order: 1 }, tab: { fixed: true } }
              },
              {
                fullPath: '/list',
                staticData: { title: '列表页面', menu: { icon: 'ri:table-line', order: 2 } },
                children: [
                  { fullPath: '/list/' },
                  {
                    fullPath: '/list/useProTable/',
                    staticData: {
                      title: '用户列表',
                      keepAlive: true,
                      menu: { icon: 'ri:apps-line' },
                      buttons: ['add']
                    }
                  },
                  {
                    fullPath: '/list/useProTable/detail/',
                    staticData: {
                      title: '用户详情',
                      keepAlive: true,
                      menu: { hide: true, activeMenu: '/list/useProTable' },
                      tab: { multi: true }
                    }
                  }
                ]
              },
              {
                fullPath: '/users/$userId',
                staticData: {
                  title: '用户资料',
                  keepAlive: true,
                  menu: { hide: true, activeMenu: '/list/useProTable' }
                }
              },
              {
                fullPath: '/iframe/$url',
                staticData: {
                  title: '内嵌页面',
                  keepAlive: true,
                  menu: { hide: true },
                  tab: { multi: true }
                }
              },
              {
                fullPath: '/docs/',
                staticData: {
                  title: '文档',
                  url: 'https://example.com/docs',
                  menu: { icon: 'ri:book-2-line' }
                }
              }
            ]
          }
        ]
      })
    );

    expect(navigation.visibleTree.map(item => item.path)).toEqual(['/docs', '/home', '/list']);
    expect(navigation.visibleTree.find(item => item.path === '/list')?.children.map(item => item.path)).toEqual([
      '/list/useProTable'
    ]);
    expect(navigation.pathMap.get('/list/useProTable/detail')).toMatchObject({
      hidden: true,
      keepAlive: true,
      multi: true,
      activeMenu: '/list/useProTable'
    });
    expect(navigation.pathMap.get('/users/$userId')?.hidden).toBe(true);
    expect(navigation.pathMap.get('/iframe/$url')).toMatchObject({ hidden: true, keepAlive: true, multi: true });
    expect(navigation.visibleTree.map(item => item.path)).not.toContain('/iframe/$url');
    expect(navigation.pathMap.get('/docs')).toMatchObject({ iframe: 'https://example.com/docs' });
    expect(navigation.permissionMap.get('/list/useProTable')).toEqual(['add']);
  });

  it('无 staticData 的节点丢弃且不提升子路由', () => {
    const navigation = generateStaticNavigation(
      router({
        id: '/(admin)',
        children: [
          {
            fullPath: '/list/',
            children: [
              {
                fullPath: '/list/useProTable/',
                staticData: { title: '用户列表' }
              }
            ]
          }
        ]
      })
    );

    expect(navigation.visibleTree).toEqual([]);
    expect(navigation.pathMap.has('/list/useProTable')).toBe(false);
  });
});
