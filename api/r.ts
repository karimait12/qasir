import { createClient } from '@supabase/supabase-js';

// Server-only environment variables. Never expose these to the client.
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;

type Device = 'mobile' | 'tablet' | 'desktop' | 'bot';

function isBot(userAgent: string): boolean {
  return /bot|crawler|spider|preview|headless|facebookexternalhit|slackbot|whatsapp/i.test(userAgent);
}

function detectDevice(userAgent: string): Device {
  if (!userAgent) return 'desktop';
  if (/ipad|tablet|kindle|(android(?!.*mobile))/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

function detectBrowser(userAgent: string): string {
  const candidates: ReadonlyArray<[string, RegExp]> = [
    ['Edge', /Edg\//],
    ['Opera', /OPR\/|Opera/],
    ['Chrome', /Chrome\/|CriOS\//],
    ['Firefox', /Firefox\/|FxiOS\//],
    ['Safari', /Safari\//],
    ['Internet Explorer', /MSIE |Trident\//],
  ];
  for (const [name, re] of candidates) {
    if (re.test(userAgent)) return name;
  }
  return 'Unknown';
}

function parseUserAgent(userAgent: string): { device: Device; browser: string } {
  const browser = detectBrowser(userAgent);
  const device: Device = isBot(userAgent) ? 'bot' : detectDevice(userAgent);
  return { device, browser };
}

function isHttpUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

type LinkRow = {
  id: string;
  target_url: string;
  is_active: boolean;
  expires_at: string | null;
};

function htmlResponse(status: number, body: string): Response {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function notFoundResponse(): Response {
  return htmlResponse(
    404,
    '<!doctype html><html><head><meta charset="utf-8"><title>Not found</title></head><body style="font-family:system-ui;text-align:center;padding:3rem"><h1>404</h1><p>This short link does not exist or is no longer active.</p></body></html>',
  );
}

function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname || null;
  } catch {
    return null;
  }
}

export default async function handler(req: Request): Promise<Response> {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code') ?? '';
  if (!CODE_RE.test(code)) return notFoundResponse();
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return notFoundResponse();

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let link: LinkRow | null = null;
  try {
    const { data } = await supabase
      .from('links')
      .select('id,target_url,is_active,expires_at')
      .eq('code', code)
      .maybeSingle<LinkRow>();
    link = data ?? null;
  } catch {
    return notFoundResponse();
  }

  if (!link || !link.is_active) return notFoundResponse();
  if (link.expires_at && Date.parse(link.expires_at) < Date.now()) return notFoundResponse();
  if (!isHttpUrl(link.target_url)) return notFoundResponse();

  // Record the click BEFORE redirecting. Failures must not block the redirect.
  try {
    const userAgent = req.headers.get('user-agent') ?? '';
    const { device, browser } = parseUserAgent(userAgent);
    const country = (req.headers.get('x-vercel-ip-country') || 'XX').slice(0, 2).toUpperCase();
    const referrer_host = referrerHost(req.headers.get('referer'));
    await supabase.from('clicks').insert({
      link_id: link.id,
      country,
      device,
      browser,
      referrer_host,
    });
  } catch {
    // Ignore analytics failures; the redirect still proceeds.
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: link.target_url,
      'cache-control': 'no-store',
    },
  });
}
