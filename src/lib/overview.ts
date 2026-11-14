// Pure helpers for overview stats. Easy to unit test.

export interface DailyPoint {
  day: string;
  clicks: number;
}

export function mobileSharePercent(
  mobile: number,
  desktop: number,
  tablet: number,
): number | null {
  const total = mobile + desktop + tablet;
  if (total <= 0) return null;
  return Math.round((mobile / total) * 1000) / 10;
}

export function deltaPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function weekdayLabel(day: string, locale?: string): string {
  const date = new Date(`${day}T00:00:00`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString(locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US'), {
    weekday: 'short',
  });
}

export function isAllZero(daily: DailyPoint[]): boolean {
  return daily.every((d) => d.clicks === 0);
}

export function peakClicks(daily: DailyPoint[]): number {
  if (daily.length === 0) return 0;
  return Math.max(...daily.map((d) => d.clicks));
}

export function barHeightPercent(clicks: number, max: number): number {
  if (max <= 0) return 2;
  return Math.max(2, Math.round((clicks / max) * 100));
}
