/** 文件下载：Blob / URL / BlobPart / Base64 */

interface DownloadOptions<T = string> {
  fileName?: string;
  source: T;
  target?: string;
}

const DEFAULT_FILENAME = 'downloaded_file';

/** 在新窗口中打开 URL（默认带 noopener,noreferrer 安全策略） */
export function openWindow(url: string, options: { secure?: boolean; target?: string } = {}): void {
  const { secure = true, target = '_blank' } = options;
  window.open(url, target, secure ? 'noopener,noreferrer' : undefined);
}

/** 创建 a 标签触发下载 */
export function triggerDownload(href: string, fileName: string | undefined, revokeDelay: number = 150): void {
  const link = document.createElement('a');
  link.href = href;
  link.style.display = 'none';
  link.rel = 'noopener noreferrer';
  link.download = fileName || DEFAULT_FILENAME;

  document.body.appendChild(link);
  // Safari 需真实 click
  try {
    link.click();
  } catch {
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  }
  link.remove();

  // 仅 blob: URL revoke
  if (href.startsWith('blob:')) {
    window.setTimeout(() => {
      try {
        URL.revokeObjectURL(href);
      } catch {
        // ignore
      }
    }, revokeDelay);
  }
}

/** URL 下载：CORS 允许则 fetch→blob，否则新窗口 */
export async function downloadFileFromUrl({ fileName, source, target = '_blank' }: DownloadOptions): Promise<void> {
  if (!source || typeof source !== 'string') throw new Error('Invalid URL.');

  const url = normalizeUrl(source);

  // iOS a[download] 不可靠，回退新窗口
  if (isIOS()) {
    openWindow(url, { target });
    return;
  }

  try {
    const res = await fetch(url, { mode: 'cors' });
    // opaque 读不到内容，回退新窗口
    if (!res.ok || res.type === 'opaque') {
      openWindow(url, { target });
      return;
    }

    const blob = await res.blob();
    const finalName = getFileNameFromHeaders(res.headers) || fileName || resolveFileName(url);
    downloadFileFromBlob({ fileName: finalName, source: blob });
  } catch {
    openWindow(url, { target });
  }
}

/** 通过 Blob 下载（axios responseType: 'blob'） */
export function downloadFileFromBlob({ fileName = DEFAULT_FILENAME, source }: DownloadOptions<Blob>): void {
  if (!(source instanceof Blob)) throw new TypeError('Invalid Blob data.');
  triggerDownload(URL.createObjectURL(source), fileName);
}

/** 通过 BlobPart 下载（前端拼接 CSV 等） */
export function downloadFileFromBlobPart({ fileName = DEFAULT_FILENAME, source }: DownloadOptions<BlobPart>): void {
  const blob = source instanceof Blob ? source : new Blob([source], { type: 'application/octet-stream' });
  triggerDownload(URL.createObjectURL(blob), fileName);
}

/** 通过 Base64 / DataURL 下载 */
export function downloadFileFromBase64({ fileName, source }: DownloadOptions): void {
  if (!source || typeof source !== 'string') throw new Error('Invalid Base64 data.');
  triggerDownload(source, fileName || DEFAULT_FILENAME);
}

/** 从 URL 解析文件名 */
function resolveFileName(url: string): string {
  try {
    const pathname = new URL(url, window.location.href).pathname || '';
    const last = pathname.split('/').filter(Boolean).pop();
    return decodeURIComponent(last || DEFAULT_FILENAME);
  } catch {
    const cleaned = url.split('#')[0].split('?')[0];
    const last = cleaned.slice(cleaned.lastIndexOf('/') + 1);
    return last ? safeDecode(last) : DEFAULT_FILENAME;
  }
}

/** 从 Content-Disposition 解析文件名 */
function getFileNameFromHeaders(headers: Headers): string | null {
  const cd = headers.get('content-disposition');
  if (!cd) return null;

  // filename*=UTF-8'' 或 filename=
  const filenameStar = /filename\*\s*=\s*([^']*)''([^;]+)/i.exec(cd);
  if (filenameStar?.[2]) return safeDecode(filenameStar[2]);

  const filename = /filename\s*=\s*"([^"]+)"/i.exec(cd) || /filename\s*=\s*([^;]+)/i.exec(cd);
  if (filename?.[1]) return safeDecode(filename[1].trim());

  return null;
}

function normalizeUrl(url: string): string {
  try {
    return new URL(url, window.location.href).toString();
  } catch {
    return url;
  }
}

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function isIOS(): boolean {
  const ua = navigator.userAgent || '';
  // iPhone/iPad/iPod + iPadOS
  return /iP(hone|od|ad)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
