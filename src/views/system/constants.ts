export const STATUS_ENUM = {
  1: { text: '启用', status: 'Success' },
  0: { text: '停用', status: 'Error' }
} as const;

export const ACCOUNT_PERMS = {
  CREATE: 'sys:user:create',
  UPDATE: 'sys:user:update',
  DELETE: 'sys:user:delete',
  RESET: 'sys:user:reset'
} as const;

export const ROLE_PERMS = {
  CREATE: 'sys:role:create',
  UPDATE: 'sys:role:update',
  DELETE: 'sys:role:delete'
} as const;

export const MENU_PERMS = {
  CREATE: 'sys:menu:create',
  UPDATE: 'sys:menu:update',
  DELETE: 'sys:menu:delete'
} as const;
