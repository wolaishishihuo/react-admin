/** 表单校验断言 + asFormRule 胶水 */
import type { Rule } from 'antd/es/form';

/** 密码强度级别 */
export enum PasswordStrength {
  WEAK = '弱',
  MEDIUM = '中',
  STRONG = '强'
}

/** 把断言函数包成 antd Form rule（空值放行） */
export function asFormRule(validate: (value: string) => boolean, message: string): Rule {
  return {
    validator: (_, value: string) => (!value || validate(value) ? Promise.resolve() : Promise.reject(new Error(message)))
  };
}

/** 验证手机号码（中国大陆：1 开头，第二位 3-9，共 11 位） */
export function validatePhone(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^1[3-9]\d{9}$/.test(value.trim());
}

/** 验证用户账号（字母开头，5-20 位，支持字母、数字、下划线） */
export function validateAccount(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return /^[a-zA-Z][a-zA-Z0-9_]{4,19}$/.test(value.trim());
}

/** 验证密码（6-20 位，必须包含字母和数字） */
export function validatePassword(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 20) return false;
  return /[a-zA-Z]/.test(trimmed) && /\d/.test(trimmed);
}

/** 验证强密码（8-20 位，必须包含大写字母、小写字母、数字和特殊字符） */
export function validateStrongPassword(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < 8 || trimmed.length > 20) return false;
  return (
    /[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed) && /\d/.test(trimmed) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmed)
  );
}

/** 评估密码强度（弱：单一字符类型或过短；中：两类组合；强：三类及以上） */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value || typeof value !== 'string') return PasswordStrength.WEAK;
  const trimmed = value.trim();
  if (trimmed.length < 6) return PasswordStrength.WEAK;

  const typeCount = [
    /[A-Z]/.test(trimmed),
    /[a-z]/.test(trimmed),
    /\d/.test(trimmed),
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmed)
  ].filter(Boolean).length;

  if (typeCount >= 3) return PasswordStrength.STRONG;
  if (typeCount >= 2) return PasswordStrength.MEDIUM;
  return PasswordStrength.WEAK;
}

/** 验证邮箱地址（RFC 5322 简化版） */
export function validateEmail(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(trimmed) && trimmed.length <= 254;
}

/** 验证 URL 地址 */
export function validateURL(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

/** 验证身份证号码（中国大陆 18 位，含出生日期与校验码验证） */
export function validateChineseIDCard(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();

  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  if (!idCardRegex.test(trimmed)) return false;

  // 身份证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(trimmed[i]) * weights[i];
  }
  return trimmed[17].toUpperCase() === checkCodes[sum % 11];
}

/** 验证银行卡号（13-19 位数字，Luhn 算法） */
export function validateBankCard(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim().replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(trimmed)) return false;

  // Luhn 校验
  let sum = 0;
  let shouldDouble = false;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    let digit = parseInt(trimmed[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit = (digit % 10) + 1;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}
