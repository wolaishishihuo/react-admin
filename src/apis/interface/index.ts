// Request response parameters (excluding data)
export interface Result {
  code: string;
  msg: string;
}

// Request response parameters (including data)
export interface ResultData<T = any> extends Result {
  data: T;
}

// paging request parameters
export interface ReqPage {
  current?: number;
  pageSize?: number;
}

// paging response parameters
export interface ResPage<T> {
  list: T[];
  current: number;
  pageSize: number;
  total: number;
}

export interface ReqLogin {
  username: string;
  password: string;
}

export interface ResLogin {
  access_token: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface UserList {
  id: string;
  username: string;
  gender: 1 | 2;
  age: number;
  idCard: string;
  email: string;
  address: string;
  createTime: string;
  status: boolean;
  avatar: string;
}

export type EnableStatus = 0 | 1;

export type MenuType = 'directory' | 'menu';

export interface MenuItem {
  id: string;
  parentId: string;
  title: string;
  path: string;
  icon: string;
  type: MenuType;
  redirect?: string;
  element?: string;
  isLink: string;
  isHide: boolean;
  isFull: boolean;
  isAffix: boolean;
  isKeepAlive: boolean;
  status: EnableStatus;
  sort: number;
  children?: MenuItem[];
}

export interface RoleItem {
  id: string;
  roleName: string;
  roleCode: string;
  status: EnableStatus;
  remark: string;
  menuIds: string[];
  createTime: string;
}

export interface AccountItem {
  id: string;
  username: string;
  nickName: string;
  gender: 1 | 2;
  phone: string;
  email: string;
  roleIds: string[];
  status: EnableStatus;
  remark: string;
  createTime: string;
}

export interface ReqAccountList extends ReqPage {
  username?: string;
  nickName?: string;
  gender?: number | string;
  status?: number | string;
}

export interface ReqRoleList extends ReqPage {
  roleName?: string;
  roleCode?: string;
  status?: number | string;
}

export interface ReqMenuList extends ReqPage {
  title?: string;
}

export type ReqCreateAccount = Omit<AccountItem, 'id' | 'createTime'>;

export type ReqCreateRole = Omit<RoleItem, 'id' | 'createTime'>;

export type ReqCreateMenu = Omit<MenuItem, 'id' | 'children'> & { id?: string };
