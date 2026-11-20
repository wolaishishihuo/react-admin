const HEX_COLOR_REG = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SIX_HEX_COLOR_REG = /^#?[0-9a-fA-F]{6}$/;

/** 校验是否为合法的 3 位或 6 位十六进制颜色值（可省略前导 `#`） */
export function isHexColor(value: string): boolean {
  return HEX_COLOR_REG.test(value);
}

/** 将 3 位或 6 位十六进制颜色规范为带前导 `#` 的大写 6 位格式 */
export function convertToSixDigitHexColor(value: string): string {
  const clean = value.startsWith('#') ? value.slice(1) : value;
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`.toUpperCase();
  }
  return `#${clean}`.toUpperCase();
}

function hexToRgb(color: string): [number, number, number] | null {
  const normalized = SIX_HEX_COLOR_REG.test(color)
    ? color.replace('#', '')
    : isHexColor(color)
      ? convertToSixDigitHexColor(color).slice(1)
      : '';
  if (!normalized) return null;

  return [parseInt(normalized.slice(0, 2), 16), parseInt(normalized.slice(2, 4), 16), parseInt(normalized.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toByteHex = (channel: number) =>
    Math.min(255, Math.max(0, Math.round(channel)))
      .toString(16)
      .padStart(2, '0');
  return `#${toByteHex(r)}${toByteHex(g)}${toByteHex(b)}`;
}

/** 加深十六进制颜色（level 取值 0–1）；非法颜色原样返回 */
export function getDarkColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return rgbToHex(20.5 * level + rgb[0] * (1 - level), 20.5 * level + rgb[1] * (1 - level), 20.5 * level + rgb[2] * (1 - level));
}

/** 变浅十六进制颜色（level 取值 0–1）；非法颜色原样返回 */
export function getLightColor(color: string, level: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return rgbToHex(255 * level + rgb[0] * (1 - level), 255 * level + rgb[1] * (1 - level), 255 * level + rgb[2] * (1 - level));
}
