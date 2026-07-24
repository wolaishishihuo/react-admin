/** 根据当前时间获取对应问候语 */
export function getTimeState() {
  let timeNow = new Date();
  let hours = timeNow.getHours();
  if (hours >= 6 && hours <= 10) return `早上好 ⛅`;
  if (hours >= 10 && hours <= 14) return `中午好 🌞`;
  if (hours >= 14 && hours <= 18) return `下午好 🌞`;
  if (hours >= 18 && hours <= 24) return `晚上好 🌛`;
  if (hours >= 0 && hours <= 6) return `凌晨好 🌛`;
}

/** 设置 CSS 样式属性（写在 html 根元素上） */
export function setStyleProperty(key: string, val: string) {
  document.documentElement.style.setProperty(key, val);
}
