import { supabase } from './supabase';
import type { Bucket, ClickRow, DailyPoint, LinkStats } from './types';

const DAY_MS = 86_400_000;
const BREAKDOWN_LIMIT = 5;

function buildSeries(rows: ClickRow[], now: number, days: number): DailyPoint[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = new Date(row.clicked_at).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const series: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    series.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return series;
}

function topBuckets(values: string[]): Bucket[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, BREAKDOWN_LIMIT);
}

/**
 * Aggregate clicks for a link in the browser. RLS restricts rows to links the
 * caller owns, so this is safe to run client-side (no stats SQL function needed).
 */
export async function getLinkStats(
  linkId: string,
  totalClicks: number,
  days: 7 | 30,
): Promise<LinkStats> {
  const now = Date.now();
  const since = new Date(now - days * DAY_MS).toISOString();

  const { data, error } = await supabase
    .from('clicks')
    .select('clicked_at,country,device,browser,referrer_host')
    .eq('link_id', linkId)
    .gte('clicked_at', since)
    .order('clicked_at', { ascending: true });

  if (error) throw new Error(error.message);

  // Keep analytics consistent with links.click_count, which excludes bots.
  const rows = ((data ?? []) as ClickRow[]).filter((row) => row.device !== 'bot');
  const last24hCutoff = now - DAY_MS;

  return {
    total: totalClicks,
    last24h: rows.filter((row) => Date.parse(row.clicked_at) >= last24hCutoff).length,
    series: buildSeries(rows, now, days),
    countries: topBuckets(rows.map((row) => row.country || 'XX')),
    devices: topBuckets(rows.map((row) => row.device || 'unknown')),
    browsers: topBuckets(rows.map((row) => row.browser || 'Unknown')),
    referrers: topBuckets(rows.map((row) => row.referrer_host || 'direct')),
  };
}
