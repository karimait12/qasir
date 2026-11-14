export const config = { runtime: 'edge' };

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

interface ClickRow {
  clicked_at: string;
  country: string | null;
  device: string | null;
  browser: string | null;
  referrer_host: string | null;
}


function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function authenticate(req: Request) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return { userId: data.user.id, admin };
}

function topBuckets(values: string[], limit = 8): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit);
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return json(405, { error: 'Method not allowed' });

  const auth = await authenticate(req);
  if (!auth) return json(401, { error: 'Unauthorized' });
  const { userId, admin } = auth;

  const url = new URL(req.url);
  const linkId = url.searchParams.get('id');
  if (!linkId) return json(400, { error: 'id is required' });

  const daysParam = Number(url.searchParams.get('days') ?? '7');
  const days = daysParam === 30 ? 30 : 7;

  const { data: link, error: linkError } = await admin
    .from('links')
    .select('id,click_count')
    .eq('id', linkId)
    .eq('user_id', userId)
    .maybeSingle();
  if (linkError) return json(500, { error: linkError.message });
  if (!link) return json(404, { error: 'Link not found' });

  const now = Date.now();
  const since = new Date(now - days * 86_400_000).toISOString();

  const { data: clicks, error: clicksError } = await admin
    .from('clicks')
    .select('clicked_at,country,device,browser,referrer_host')
    .eq('link_id', linkId)
    .gte('clicked_at', since)
    .order('clicked_at', { ascending: true });

  if (clicksError) return json(500, { error: clicksError.message });

  const rows = (clicks ?? []) as ClickRow[];
  const humanRows = rows.filter((row) => row.device !== 'bot');

  const last24hCutoff = now - 86_400_000;
  const last24h = humanRows.filter((row) => Date.parse(row.clicked_at) >= last24hCutoff).length;

  const counts = new Map<string, number>();
  for (const row of humanRows) {
    const key = new Date(row.clicked_at).toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const series: Array<{ date: string; count: number }> = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const key = new Date(now - i * 86_400_000).toISOString().slice(0, 10);
    series.push({ date: key, count: counts.get(key) ?? 0 });
  }

  const mobileCount = humanRows.filter((row) => row.device === 'mobile').length;
  const mobileShare = humanRows.length > 0 ? (mobileCount / humanRows.length) * 100 : 0;
  const uniqueCountries = new Set(humanRows.map((row) => row.country || 'XX')).size;

  const response = {
    totalClicks: link.click_count,
    uniqueCountries,
    mobileShare: Math.round(mobileShare * 10) / 10,
    avgLatency: null,
    last24h,
    series,
    countries: topBuckets(humanRows.map((row) => row.country || 'XX')),
    devices: topBuckets(humanRows.map((row) => row.device || 'unknown')),
    browsers: topBuckets(humanRows.map((row) => row.browser || 'Unknown')),
    referrers: topBuckets(humanRows.map((row) => row.referrer_host || 'direct')),
  };

  return json(200, response);
}
