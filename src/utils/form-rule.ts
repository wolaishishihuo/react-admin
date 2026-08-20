import type { Rule } from 'antd/es/form';

/** 把断言函数包成 antd Form rule（空值放行） */
export function asFormRule(validate: (value: string) => boolean, message: string): Rule {
  return {
    validator: (_, value: string) => (!value || validate(value) ? Promise.resolve() : Promise.reject(new Error(message)))
  };
}
