import {
  AccountItem,
  MenuItem,
  ReqAccountList,
  ReqCreateAccount,
  ReqCreateMenu,
  ReqCreateRole,
  ReqMenuList,
  ReqRoleList,
  ResPage,
  RoleItem
} from '@/apis/interface';

import {
  createAccount,
  createMenu,
  createRole,
  deleteAccount,
  deleteMenu,
  deleteRole,
  filterMenuTree,
  getAccounts,
  getMenuTree,
  getRoles,
  updateAccount,
  updateMenu,
  updateRole
} from './mock';

export { BUILTIN_ROLE_CODES, BUILTIN_USERNAMES, excludeMenuTree, findMenu, getAccounts, getMenuTree, getRoles } from './mock';

function delay(time = 240) {
  if (import.meta.env.MODE === 'test') return Promise.resolve();
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, time);
  });
}

function paginate<T>(list: T[], current: number, pageSize: number): ResPage<T> {
  return {
    list: list.slice((current - 1) * pageSize, current * pageSize),
    current,
    pageSize,
    total: list.length
  };
}

function matchStatus(value: number, status?: number | string) {
  return status === undefined || status === '' ? true : value === Number(status);
}

export async function fetchGetAccountList(params: ReqAccountList) {
  await delay();
  const { current = 1, pageSize = 10, username, nickName, gender, status } = params;
  const list = getAccounts().filter(item => {
    const matchUser = username ? item.username.includes(username) : true;
    const matchNick = nickName ? item.nickName.includes(nickName) : true;
    const matchGender = gender === undefined || gender === '' ? true : item.gender === Number(gender);
    return matchUser && matchNick && matchGender && matchStatus(item.status, status);
  });
  return paginate(list, current, pageSize);
}

export async function fetchCreateAccount(record: ReqCreateAccount) {
  await delay();
  return createAccount(record);
}

export async function fetchUpdateAccount(record: AccountItem) {
  await delay();
  updateAccount(record);
}

export async function fetchDeleteAccount(id: string) {
  await delay();
  deleteAccount(id);
}

export async function fetchResetAccountPassword() {
  await delay();
}

export async function fetchGetRoleList(params: ReqRoleList) {
  await delay();
  const { current = 1, pageSize = 10, roleName, roleCode, status } = params;
  const list = getRoles().filter(item => {
    const matchName = roleName ? item.roleName.includes(roleName) : true;
    const matchCode = roleCode ? item.roleCode.includes(roleCode) : true;
    return matchName && matchCode && matchStatus(item.status, status);
  });
  return paginate(list, current, pageSize);
}

export async function fetchCreateRole(record: ReqCreateRole) {
  await delay();
  return createRole(record);
}

export async function fetchUpdateRole(record: RoleItem) {
  await delay();
  updateRole(record);
}

export async function fetchDeleteRole(id: string) {
  await delay();
  deleteRole(id);
}

export async function fetchGetMenuList(params: ReqMenuList) {
  await delay();
  const list = filterMenuTree(getMenuTree(), params.title);
  return paginate(list, 1, list.length || 1);
}

export async function fetchCreateMenu(record: ReqCreateMenu) {
  await delay();
  return createMenu(record);
}

export async function fetchUpdateMenu(record: MenuItem) {
  await delay();
  updateMenu(record);
}

export async function fetchDeleteMenu(id: string) {
  await delay();
  deleteMenu(id);
}
