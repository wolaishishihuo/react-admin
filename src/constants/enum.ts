/**
 * @description Request configuration status codes
 */
export enum ResultEnum {
  SUCCESS = 200,
  ERROR = 500,
  OVERDUE = 401,
  TIMEOUT = 30000,
  TYPE = 'success'
}

/**
 * @description React Router mode
 */
export enum RouterModeEnum {
  HASH = 'hash',
  HISTORY = 'history'
}
