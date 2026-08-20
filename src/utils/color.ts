export function isHexColor(str: string) {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(str);
}

export function convertToSixDigitHexColor(str: string) {
  if (str.length > 4) return str.toLocaleUpperCase();
  return (str[0] + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]).toLocaleUpperCase();
}

export function hexToRgb(str: string): [number, number, number] | null {
  if (!/^#?[0-9A-Fa-f]{6}$/.test(str)) return null;
  const hex = str.replace('#', '');
  const pairs = hex.match(/../g);
  if (!pairs) return null;
  return [parseInt(pairs[0], 16), parseInt(pairs[1], 16), parseInt(pairs[2], 16)];
}

export function rgbToHex(r: number, g: number, b: number) {
  if (![r, g, b].every(value => Number.isInteger(value) && value >= 0 && value <= 255)) return null;
  const hexs = [r, g, b].map(value => value.toString(16).padStart(2, '0'));
  return `#${hexs.join('')}`;
}

export function getDarkColor(color: string, level: number) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  const next = rgb.map(value => Math.round(20.5 * level + value * (1 - level))) as [number, number, number];
  return rgbToHex(...next) ?? color;
}

export function getLightColor(color: string, level: number) {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  const next = rgb.map(value => Math.round(255 * level + value * (1 - level))) as [number, number, number];
  return rgbToHex(...next) ?? color;
}
