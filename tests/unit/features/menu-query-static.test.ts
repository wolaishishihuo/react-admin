import { QueryClient } from '@tanstack/react-query';
import type { AnyRouter } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';
import { getAuthMenuListApi } from '@/features/navigation/api';
import { ensureAuthorizedNavigation } from '@/features/navigation/menu-query';

vi.mock('@/features/navigation/route-mode', () => ({
  AUTH_ROUTE_MODE: 'static'
}));

vi.mock('@/features/navigation/api', () => ({
  getAuthMenuListApi: vi.fn()
}));

describe('static navigation query', () => {
  it('不请求菜单接口，从 (admin) route tree 生成', async () => {
    const client = new QueryClient();
    const router = {
      routeTree: {
        id: '__root__',
        fullPath: '/',
        children: {
          admin: {
            id: '/(admin)',
            children: [
              {
                fullPath: '/home/',
                staticData: { title: '首页' }
              }
            ]
          }
        }
      }
    } as unknown as AnyRouter;

    const result = await ensureAuthorizedNavigation(client, router);

    expect(getAuthMenuListApi).not.toHaveBeenCalled();
    expect([...result.pathSet]).toEqual(['/home']);
    expect(result.visibleTree.map(item => item.path)).toEqual(['/home']);
  });
});
