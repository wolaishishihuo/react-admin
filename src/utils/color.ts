import { message } from '@/hooks/useMessage';

/** 将 3 位 HEX 颜色码转换为 6 位 */
export function convertToSixDigitHexColor(str: string) {
  if (str.length > 4) return str.toLocaleUpperCase();
  else return (str[0] + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]).toLocaleUpperCase();
}

/** 十六进制颜色转 RGB */
export function hexToRgb(str: string) {
  let hexs: any = '';
  let reg = /^#?[0-9A-Fa-f]{6}$/;
  if (!reg.test(str)) return message.warning('Enter wrong hex color value');
  str = str.replace('#', '');
  hexs = str.match(/../g);
  for (let i = 0; i < 3; i++) hexs[i] = parseInt(hexs[i], 16);
  return hexs;
}

/** RGB 颜色转十六进制 */
export function rgbToHex(r: any, g: any, b: any) {
  let reg = /^\d{1,3}$/;
  if (!reg.test(r) || !reg.test(g) || !reg.test(b)) return message.warning('Enter wrong rgb color value');
  let hexs = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i = 0; i < 3; i++) if (hexs[i].length == 1) hexs[i] = `0${hexs[i]}`;
  return `#${hexs.join('')}`;
}

/** 加深颜色值（level 0-1） */
export function getDarkColor(color: string, level: number) {
  let reg = /^#?[0-9A-Fa-f]{6}$/;
  if (!reg.test(color)) return message.warning('Enter wrong hex color value');
  let rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(20.5 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

/** 变浅颜色值（level 0-1） */
export function getLightColor(color: string, level: number) {
  let reg = /^#?[0-9A-Fa-f]{6}$/;
  if (!reg.test(color)) message.warning('Enter wrong hex color value');
  let rgb = hexToRgb(color);
  for (let i = 0; i < 3; i++) rgb[i] = Math.round(255 * level + rgb[i] * (1 - level));
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}
