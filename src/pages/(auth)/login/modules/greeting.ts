/** 根据当前时间获取对应问候语 */
export function getTimeState() {
  const hours = new Date().getHours();
  if (hours >= 6 && hours <= 10) return `早上好 ⛅`;
  if (hours >= 10 && hours <= 14) return `中午好 🌞`;
  if (hours >= 14 && hours <= 18) return `下午好 🌞`;
  if (hours >= 18 && hours <= 24) return `晚上好 🌛`;
  return `凌晨好 🌛`;
}
