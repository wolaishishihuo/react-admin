/**
 * 将 Ant Design App Context 中的反馈实例桥接为组件外可调用的稳定代理。
 * 实例由 AntdBridge 注册，业务模块无需绕过 Context 使用静态 API。
 */
import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';

let messageInstance: MessageInstance | undefined;
let notificationInstance: NotificationInstance | undefined;
let modalInstance: Omit<ModalStaticFunctions, 'warn'> | undefined;

export function registerFeedback(instances: {
  message: MessageInstance;
  notification: NotificationInstance;
  modal: Omit<ModalStaticFunctions, 'warn'>;
}) {
  messageInstance = instances.message;
  notificationInstance = instances.notification;
  modalInstance = instances.modal;
}

function createProxy<T extends object>(getInstance: () => T | undefined, name: string) {
  return new Proxy({} as T, {
    get(_target, prop) {
      const instance = getInstance();
      if (!instance) throw new Error(`[feedback] ${name} 尚未注册`);
      const value = instance[prop as keyof T];
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(instance) : value;
    }
  });
}

export const message = createProxy(() => messageInstance, 'message');
export const notification = createProxy(() => notificationInstance, 'notification');
export const modal = createProxy(() => modalInstance, 'modal');
