/** 只接受 http/https 绝对地址，拒绝 javascript/data/ftp 与协议相对 URL */
export function isHttpUrl(url?: string): boolean {
  if (!url) return false;
  return /^https?:\/\/.*$/.test(url);
}

/** 去掉首尾空白后的 http(s) 地址；非法则 undefined */
export function toHttpUrl(url?: string | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed || !isHttpUrl(trimmed)) return undefined;
  return trimmed;
}

export function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
