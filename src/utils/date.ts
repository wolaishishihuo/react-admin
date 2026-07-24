/** 日期范围预设（接 RangePicker presets） */
import dayjs from 'dayjs';

export type DateRange = [dayjs.Dayjs, dayjs.Dayjs];

export function getTodayRange(): DateRange {
  const today = dayjs();
  return [today.startOf('day'), today.endOf('day')];
}

export function getYesterdayRange(): DateRange {
  const yesterday = dayjs().subtract(1, 'day');
  return [yesterday.startOf('day'), yesterday.endOf('day')];
}

/** 本周范围（周一起，zh-cn locale） */
export function getThisWeekRange(): DateRange {
  const today = dayjs();
  return [today.startOf('week'), today.endOf('week')];
}

/** 本月范围 */
export function getThisMonthRange(): DateRange {
  const today = dayjs();
  return [today.startOf('month'), today.endOf('month')];
}

/** 上月范围 */
export function getLastMonthRange(): DateRange {
  const lastMonth = dayjs().subtract(1, 'month');
  return [lastMonth.startOf('month'), lastMonth.endOf('month')];
}

export function getThisYearRange(): DateRange {
  const today = dayjs();
  return [today.startOf('year'), today.endOf('year')];
}

/** 最近 N 天（含今天） */
export function getLastDaysRange(days: number): DateRange {
  const today = dayjs();
  return [today.subtract(days - 1, 'day').startOf('day'), today.endOf('day')];
}

/** 月区间 → [首月首日, 末月末日] yyyy-MM-dd；缺任一端给 [undefined, undefined] */
export function monthRangeToDays(range?: [dayjs.ConfigType, dayjs.ConfigType] | null): [string | undefined, string | undefined] {
  if (!range?.[0] || !range?.[1]) return [undefined, undefined];
  return [dayjs(range[0]).startOf('month').format('YYYY-MM-DD'), dayjs(range[1]).endOf('month').format('YYYY-MM-DD')];
}

/** 日区间 → [当日 00:00:00, 当日 23:59:59] yyyy-MM-dd HH:mm:ss；空端各自给 undefined */
export function dayRangeToTimes(range?: [dayjs.ConfigType, dayjs.ConfigType] | null): [string | undefined, string | undefined] {
  const [start, end] = range ?? [];
  return [
    start ? dayjs(start).startOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined,
    end ? dayjs(end).endOf('day').format('YYYY-MM-DD HH:mm:ss') : undefined
  ];
}
