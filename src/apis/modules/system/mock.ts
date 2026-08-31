import { AccountItem, MenuItem, ReqCreateAccount, ReqCreateMenu, ReqCreateRole, RoleItem } from '@/apis/interface';
import authMenuList from '@/assets/json/authMenuList.json';
import { RouteObjectType } from '@/routers/interface';

export const BUILTIN_ROLE_CODES = ['admin'];
export const BUILTIN_USERNAMES = ['admin'];

const USER_MENU_IDS = ['home', 'system', 'accountManage', 'roleManage'];

function formatTime(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function convertRouteToMenu(routes: RouteObjectType[], parentId = ''): MenuItem[] {
  return routes.map((item, index) => {
    const id = item.meta?.key || item.path || `${parentId}-${index}`;
    const children = item.children?.length ? convertRouteToMenu(item.children, id) : undefined;
    return {
      id,
      parentId,
      title: item.meta?.title || '',
      path: item.path || '',
      icon: item.meta?.icon || '',
      type: children?.length ? 'directory' : 'menu',
      redirect: item.redirect,
      element: typeof item.element === 'string' ? item.element : undefined,
      isLink: item.meta?.isLink || '',
      isHide: !!item.meta?.isHide,
      isFull: !!item.meta?.isFull,
      isAffix: !!item.meta?.isAffix,
      isKeepAlive: !!item.meta?.isKeepAlive,
      status: 1,
      sort: index + 1,
      children
    };
  });
}

function createSeedMenus() {
  return convertRouteToMenu(authMenuList.data as RouteObjectType[]);
}

function createSeedRoles(): RoleItem[] {
  return [
    {
      id: '1',
      roleName: '超级管理员',
      roleCode: 'admin',
      status: 1,
      remark: '拥有系统全部菜单权限',
      menuIds: getMenuIds(menuList),
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: '2',
      roleName: '普通用户',
      roleCode: 'user',
      status: 1,
      remark: '可访问首页与账号、角色管理',
      menuIds: USER_MENU_IDS,
      createTime: '2024-03-12 09:30:00'
    },
    {
      id: '3',
      roleName: '访客',
      roleCode: 'guest',
      status: 1,
      remark: '仅可访问首页',
      menuIds: ['home'],
      createTime: '2024-06-20 14:00:00'
    }
  ];
}

function createSeedAccounts(): AccountItem[] {
  return [
    {
      id: '1',
      username: 'admin',
      nickName: '管理员',
      gender: 1,
      phone: '18888888888',
      email: 'admin@example.com',
      roleIds: ['1'],
      status: 1,
      remark: '系统内置超级管理员',
      createTime: '2024-01-01 10:00:00'
    },
    {
      id: '2',
      username: 'user',
      nickName: '普通用户',
      gender: 2,
      phone: '16666666666',
      email: 'user@example.com',
      roleIds: ['2'],
      status: 1,
      remark: '系统内置普通用户',
      createTime: '2024-03-12 09:30:00'
    },
    {
      id: '3',
      username: 'guest',
      nickName: '访客',
      gender: 1,
      phone: '15555555555',
      email: 'guest@example.com',
      roleIds: ['3'],
      status: 1,
      remark: '只读访客',
      createTime: '2024-06-20 14:20:00'
    },
    {
      id: '4',
      username: 'linda',
      nickName: '林黛',
      gender: 2,
      phone: '13700001111',
      email: 'linda@example.com',
      roleIds: ['2'],
      status: 1,
      remark: '',
      createTime: '2025-02-18 11:06:00'
    },
    {
      id: '5',
      username: 'tom',
      nickName: '汤姆',
      gender: 1,
      phone: '13700002222',
      email: 'tom@example.com',
      roleIds: ['3'],
      status: 0,
      remark: '已停用',
      createTime: '2025-08-03 16:40:00'
    }
  ];
}

let menuList: MenuItem[] = createSeedMenus();
let roleList: RoleItem[] = createSeedRoles();
let accountList: AccountItem[] = createSeedAccounts();

export function resetSystemMock() {
  menuList = createSeedMenus();
  roleList = createSeedRoles();
  accountList = createSeedAccounts();
}

export function findMenu(id: string, tree = menuList): MenuItem | undefined {
  for (const item of tree) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findMenu(id, item.children);
      if (found) return found;
    }
  }
}

export function getMenuIds(tree = menuList): string[] {
  return tree.flatMap(item => [item.id, ...(item.children ? getMenuIds(item.children) : [])]);
}

export function getMenuTree() {
  return menuList;
}

export function excludeMenuTree(tree: MenuItem[], id?: string): MenuItem[] {
  if (!id) return tree;
  return tree
    .filter(item => item.id !== id)
    .map(item => ({ ...item, children: item.children ? excludeMenuTree(item.children, id) : undefined }));
}

export function filterMenuTree(tree: MenuItem[], keyword?: string): MenuItem[] {
  if (!keyword) return tree;
  const loop = (nodes: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];
    nodes.forEach(node => {
      const children = node.children ? loop(node.children) : [];
      if (node.title.includes(keyword)) result.push({ ...node });
      else if (children.length) result.push({ ...node, children });
    });
    return result;
  };
  return loop(tree);
}

function insertMenu(list: MenuItem[], record: MenuItem): boolean {
  if (!record.parentId) {
    list.push(record);
    return true;
  }
  const parent = findMenu(record.parentId, list);
  if (!parent) return false;
  parent.type = 'directory';
  parent.children = parent.children || [];
  parent.children.push(record);
  return true;
}

function removeMenuFromTree(list: MenuItem[], id: string): boolean {
  const index = list.findIndex(item => item.id === id);
  if (index !== -1) {
    list.splice(index, 1);
    return true;
  }
  return list.some(item => item.children && removeMenuFromTree(item.children, id));
}

export function createMenu(record: ReqCreateMenu) {
  const menu: MenuItem = { ...record, parentId: record.parentId || '', id: record.id || `menu_${Date.now()}` };
  insertMenu(menuList, menu);
  return menu;
}

export function updateMenu(record: MenuItem) {
  const current = findMenu(record.id);
  if (!current) return;
  if (current.parentId !== record.parentId) {
    const children = current.children;
    removeMenuFromTree(menuList, record.id);
    insertMenu(menuList, { ...record, children });
    return;
  }
  Object.assign(current, record, { children: current.children });
}

export function deleteMenu(id: string) {
  return removeMenuFromTree(menuList, id);
}

export function getRoles() {
  return roleList.map(item => (item.roleCode === 'admin' ? { ...item, menuIds: getMenuIds() } : item));
}

export function getAccounts() {
  return accountList;
}

export function createRole(record: ReqCreateRole) {
  const role: RoleItem = { ...record, id: `role_${Date.now()}`, createTime: formatTime() };
  roleList = [role, ...roleList];
  return role;
}

export function updateRole(record: RoleItem) {
  roleList = roleList.map(item => (item.id === record.id ? { ...item, ...record } : item));
}

export function deleteRole(id: string) {
  roleList = roleList.filter(item => item.id !== id);
}

export function createAccount(record: ReqCreateAccount) {
  const account: AccountItem = { ...record, id: `user_${Date.now()}`, createTime: formatTime() };
  accountList = [account, ...accountList];
  return account;
}

export function updateAccount(record: AccountItem) {
  accountList = accountList.map(item => (item.id === record.id ? { ...item, ...record } : item));
}

export function deleteAccount(id: string) {
  accountList = accountList.filter(item => item.id !== id);
}
