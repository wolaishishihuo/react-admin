function hasControlChars(value: string) {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

/** 只接受站内相对路径，拒绝协议相对 URL、协议 URL、反斜杠和控制字符 */
export function isSafeRedirect(value?: string | null): value is string {
  if (!value) return false;
  if (!value.startsWith('/') || value.startsWith('//')) return false;
  if (value.includes('\\')) return false;
  if (hasControlChars(value)) return false;
  if (/^[a-zA-Z][a-zA-Z+\-.]*:/.test(value)) return false;
  return true;
}
