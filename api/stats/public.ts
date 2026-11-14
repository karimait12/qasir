export const config = { runtime: 'edge' };

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return json(405, { error: 'Method not allowed' });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json(200, { totalClicks: 0, uniqueCountries: 0, mobileShare: 0, series: [], available: false });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = Date.now();
  const since = new Date(now - 7 * 86_400_000).toISOString();

  const { data: clicks, error } = await admin
    .from('clicks')
    .select('clicked_at,country,device,referrer_host')
    .gte('clicked_at', since);

  if (error) return json(500, { error: error.message });

  const rows = (clicks ?? []) as Array<{ clicked_at: string; country: string | null; device: string | null; referrer_host: string | null }>;
  const human = rows.filter((r) => r.device !== 'bot');

  const counts = new Map<string, number>();
  for (const r of human) {
    const key = new Date(r.clicked_at).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const series: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    series.push({ date: key, count: counts.get(key) ?? 0 });
  }

  const mobileCount = human.filter((r) => r.device === 'mobile').length;
  const mobileShare = human.length > 0 ? Math.round((mobileCount / human.length) * 1000) / 10 : 0;
  const uniqueCountries = new Set(human.map((r) => r.country || 'XX')).size;

  // Top countries
  const countryCounts = new Map<string, number>();
  for (const r of human) {
    const c = r.country || 'XX';
    countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
  }
  const countries = [...countryCounts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top referrers
  const refCounts = new Map<string, number>();
  for (const r of human) {
    const host = r.referrer_host || 'Direct';
    refCounts.set(host, (refCounts.get(host) ?? 0) + 1);
  }
  const referrers = [...refCounts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return json(200, {
    totalClicks: human.length,
    uniqueCountries,
    mobileShare,
    series,
    countries,
    referrers,
    available: true,
  });
}
