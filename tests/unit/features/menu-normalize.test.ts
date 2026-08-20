import { describe, expect, it } from 'vitest';
import { normalizeBackendMenu, normalizePath, toTanStackRoutePath } from '@/features/navigation/menu-normalize';
import type { BackendMenuItem } from '@/features/navigation/types';

describe('normalizePath', () => {
  it('补前导斜杠、去掉末尾斜杠和 query/hash', () => {
    expect(normalizePath('home')).toBe('/home');
    expect(normalizePath('/list/useProTable/')).toBe('/list/useProTable');
    expect(normalizePath('/list/useProTable?page=1')).toBe('/list/useProTable');
    expect(normalizePath('/home#hash')).toBe('/home');
    expect(normalizePath('//list///a/')).toBe('/list/a');
  });

  it('根路径保留单个斜杠', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('旧首页 /home/index 映射为 /home', () => {
    expect(normalizePath('/home/index')).toBe('/home');
    expect(normalizePath('/home/index/')).toBe('/home');
  });
});

describe('toTanStackRoutePath', () => {
  it('把后端 :param 转成 $param', () => {
    expect(toTanStackRoutePath('/users/:userId')).toBe('/users/$userId');
    expect(toTanStackRoutePath('users/:userId/profile')).toBe('/users/$userId/profile');
  });
});

describe('normalizeBackendMenu', () => {
  it('映射旧字段并忽略 element', () => {
    const input: BackendMenuItem[] = [
      {
        path: '/home/index',
        element: '/home/index',
        meta: {
          key: 'home',
          title: '首页',
          icon: 'ri:home-smile-2-line',
          isAffix: true,
          isLink: '',
          isHide: false
        }
      },
      {
        path: '/list',
        redirect: '/list/useProTable/',
        meta: { key: 'list', title: '列表页面', icon: 'ri:table-line' },
        children: [
          {
            path: '/list/useProTable',
            element: '/list/useProTable/index',
            meta: {
              key: 'useProTable',
              title: '用户列表',
              auths: ['add', 'edit'],
              isKeepAlive: true
            }
          }
        ]
      }
    ];

    const tree = normalizeBackendMenu(input);
    expect(tree[0]).toMatchObject({
      id: 'home',
      path: '/home',
      title: '首页',
      icon: 'ri:home-smile-2-line',
      hidden: false,
      fixed: true,
      permissions: []
    });
    expect(tree[0]?.external).toBeUndefined();
    expect(tree[1]).toMatchObject({
      id: 'list',
      path: '/list',
      redirect: '/list/useProTable'
    });
    expect(tree[1]?.children[0]).toMatchObject({
      id: 'useProTable',
      path: '/list/useProTable',
      permissions: ['add', 'edit']
    });
  });

  it('丢弃空 title', () => {
    const tree = normalizeBackendMenu([{ path: '/ghost', meta: { key: 'ghost', title: '' } }]);
    expect(tree).toEqual([]);
  });

  it('转换动态 path 并只保留 http(s) 外链', () => {
    const tree = normalizeBackendMenu([
      {
        path: '/users/:userId',
        meta: { key: 'user', title: '用户资料', isLink: 'https://example.com' }
      },
      {
        path: '/evil',
        meta: { key: 'evil', title: '恶意外链', isLink: 'javascript:alert(1)' }
      }
    ]);
    expect(tree[0]).toMatchObject({ path: '/users/$userId', external: 'https://example.com' });
    expect(tree[1]?.external).toBeUndefined();
  });
});
