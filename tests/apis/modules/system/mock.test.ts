import { beforeEach, describe, expect, it } from 'vitest';

import {
  createAccount,
  createMenu,
  createRole,
  deleteAccount,
  deleteMenu,
  deleteRole,
  excludeMenuTree,
  filterMenuTree,
  findMenu,
  getAccounts,
  getMenuIds,
  getMenuTree,
  getRoles,
  resetSystemMock,
  updateAccount,
  updateMenu,
  updateRole
} from '@/apis/modules/system/mock';

describe('system mock store', () => {
  beforeEach(() => {
    resetSystemMock();
  });

  describe('accounts', () => {
    it('seeds builtin admin and user accounts', () => {
      expect(getAccounts().map(item => item.username)).toEqual(['admin', 'user', 'guest', 'linda', 'tom']);
    });

    it('prepends a created account with id and createTime', () => {
      const created = createAccount({
        username: 'amy',
        nickName: '艾米',
        gender: 2,
        phone: '13700003333',
        email: 'amy@example.com',
        roleIds: ['2'],
        status: 1,
        remark: ''
      });

      expect(created.id.startsWith('user_')).toBe(true);
      expect(created.createTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
      expect(getAccounts()[0]).toEqual(created);
    });

    it('updates and deletes an account by id', () => {
      updateAccount({ ...getAccounts()[4], status: 1, nickName: '汤姆启用' });
      expect(getAccounts().find(item => item.id === '5')?.nickName).toBe('汤姆启用');

      deleteAccount('5');
      expect(getAccounts().some(item => item.id === '5')).toBe(false);
    });
  });

  describe('roles', () => {
    it('keeps admin menuIds in sync with the full menu tree', () => {
      const before = getRoles().find(item => item.roleCode === 'admin')?.menuIds ?? [];
      expect(before).toEqual(getMenuIds());

      createMenu({
        id: 'audit',
        parentId: '',
        title: '审计',
        path: '/audit',
        icon: 'ri:file-list-line',
        type: 'menu',
        isLink: '',
        isHide: false,
        isFull: false,
        isAffix: false,
        isKeepAlive: true,
        status: 1,
        sort: 9
      });

      const after = getRoles().find(item => item.roleCode === 'admin')?.menuIds ?? [];
      expect(after).toContain('audit');
      expect(after.length).toBe(before.length + 1);
    });

    it('creates, updates and deletes a custom role', () => {
      const created = createRole({
        roleName: '运营',
        roleCode: 'ops',
        status: 1,
        remark: '',
        menuIds: ['home']
      });

      expect(created.id.startsWith('role_')).toBe(true);
      expect(getRoles()[0]).toEqual(created);

      updateRole({ ...created, roleName: '运营主管' });
      expect(getRoles().find(item => item.id === created.id)?.roleName).toBe('运营主管');

      deleteRole(created.id);
      expect(getRoles().some(item => item.id === created.id)).toBe(false);
    });
  });

  describe('menus', () => {
    it('builds the tree from authMenuList keys', () => {
      expect(getMenuTree().map(item => item.id)).toEqual(['home', 'system']);
      expect(findMenu('accountManage')?.title).toBe('账号管理');
      expect(findMenu('system')?.type).toBe('directory');
    });

    it('inserts a child and promotes the parent to directory', () => {
      const created = createMenu({
        parentId: 'home',
        title: '工作台',
        path: '/home/workbench',
        icon: 'ri:dashboard-line',
        type: 'menu',
        isLink: '',
        isHide: false,
        isFull: false,
        isAffix: false,
        isKeepAlive: true,
        status: 1,
        sort: 2
      });

      const home = findMenu('home');
      expect(home?.type).toBe('directory');
      expect(home?.children?.some(item => item.id === created.id)).toBe(true);
    });

    it('moves a menu to a new parent', () => {
      const created = createMenu({
        parentId: 'system',
        title: '字典',
        path: '/system/dict',
        icon: 'ri:book-2-line',
        type: 'menu',
        isLink: '',
        isHide: false,
        isFull: false,
        isAffix: false,
        isKeepAlive: true,
        status: 1,
        sort: 4
      });

      updateMenu({ ...created, parentId: '' });
      expect(findMenu(created.id)?.parentId).toBe('');
      expect(getMenuTree().some(item => item.id === created.id)).toBe(true);
      expect(findMenu('system')?.children?.some(item => item.id === created.id)).toBe(false);
    });

    it('deletes a node from the tree', () => {
      deleteMenu('menuMange');
      expect(findMenu('menuMange')).toBeUndefined();
    });

    it('filters by title and keeps unmatched parents that have hits', () => {
      const filtered = filterMenuTree(getMenuTree(), '账号');
      expect(filtered.map(item => item.id)).toEqual(['system']);
      expect(filtered[0].children?.map(item => item.id)).toEqual(['accountManage']);
    });

    it('returns the original tree when the keyword is empty', () => {
      expect(filterMenuTree(getMenuTree())).toBe(getMenuTree());
    });

    it('excludes a node so it cannot be chosen as its own parent', () => {
      const tree = excludeMenuTree(getMenuTree(), 'system');
      expect(tree.map(item => item.id)).toEqual(['home']);
      expect(findMenu('accountManage', tree)).toBeUndefined();
    });
  });
});
