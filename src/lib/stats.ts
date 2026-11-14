import { apiFetch } from './api';
import type { LinkStats } from './types';

export async function getLinkStats(
  linkId: string,
  _totalClicks: number,
  days: 7 | 30,
): Promise<LinkStats> {
  const data = await apiFetch<{
    totalClicks: number;
    uniqueCountries: number;
    mobileShare: number;
    avgLatency: number | null;
    last24h: number;
    series: Array<{ date: string; count: number }>;
    countries: Array<{ value: string; count: number }>;
    devices: Array<{ value: string; count: number }>;
    browsers: Array<{ value: string; count: number }>;
    referrers: Array<{ value: string; count: number }>;
  }>(`/api/stats?id=${encodeURIComponent(linkId)}&days=${days}`);

  return {
    total: data.totalClicks,
    last24h: data.last24h,
    series: data.series ?? [],
    countries: data.countries ?? [],
    devices: data.devices ?? [],
    browsers: data.browsers ?? [],
    referrers: data.referrers ?? [],
    uniqueCountries: data.uniqueCountries,
    mobileShare: data.mobileShare,
    avgLatency: data.avgLatency,
  };
}
