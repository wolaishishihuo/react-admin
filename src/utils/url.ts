/** 只接受 http/https 绝对地址，拒绝 javascript/data/ftp 与协议相对 URL */
export function isHttpUrl(url?: string): boolean {
  if (!url) return false;
  return /^https?:\/\/.*$/.test(url);
}

export function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
