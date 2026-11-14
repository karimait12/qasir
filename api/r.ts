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

function getHeader(req: any, name: string): string {
  if (req.headers && typeof req.headers.get === 'function') {
    return req.headers.get(name) ?? '';
  }
  if (req.headers && typeof req.headers === 'object') {
    const val = req.headers[name.toLowerCase()];
    if (Array.isArray(val)) return val[0] ?? '';
    return val ?? '';
  }
  return '';
}

function getQueryCode(req: any): string {
  if (req.query && typeof req.query.code === 'string') {
    return req.query.code;
  }
  const rawUrl: string = req.url ?? '';
  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    return parsed.searchParams.get('code') ?? '';
  } catch {
    return '';
  }
}

export default async function handler(req: any, res?: any): Promise<any> {
  const code = getQueryCode(req);
  if (!CODE_RE.test(code)) {
    if (res && typeof res.status === 'function') {
      res.status(404);
      return res.send ? res.send('Not found') : res.end('Not found');
    }
    return notFoundResponse();
  }
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    if (res && typeof res.status === 'function') {
      res.status(404);
      return res.send ? res.send('Not found') : res.end('Not found');
    }
    return notFoundResponse();
  }

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
    if (res && typeof res.status === 'function') {
      res.status(404);
      return res.send ? res.send('Not found') : res.end('Not found');
    }
    return notFoundResponse();
  }

  if (!link || !link.is_active) {
    if (res && typeof res.status === 'function') {
      res.status(404);
      return res.send ? res.send('Not found') : res.end('Not found');
    }
    return notFoundResponse();
  }
  if (link.expires_at && Date.parse(link.expires_at) < Date.now()) {
    if (res && typeof res.status === 'function') {
      res.status(404);
      return res.send ? res.send('Not found') : res.end('Not found');
    }
    return notFoundResponse();
  }
  if (!isHttpUrl(link.target_url)) {
    if (res && typeof res.status === 'function') {
      res.status(404);
      return res.send ? res.send('Not found') : res.end('Not found');
    }
    return notFoundResponse();
  }

  // Record the click BEFORE redirecting. Failures must not block the redirect.
  try {
    const userAgent = getHeader(req, 'user-agent');
    const { device, browser } = parseUserAgent(userAgent);
    const country = (getHeader(req, 'x-vercel-ip-country') || 'XX').slice(0, 2).toUpperCase();
    const referrer_host = referrerHost(getHeader(req, 'referer'));
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

  // Handle Node.js response (res.redirect or res.writeHead)
  if (res && typeof res.redirect === 'function') {
    res.setHeader('cache-control', 'no-store');
    return res.redirect(302, link.target_url);
  }
  if (res && typeof res.writeHead === 'function') {
    res.writeHead(302, {
      location: link.target_url,
      'cache-control': 'no-store',
    });
    return res.end();
  }

  // Handle Web Standard Response
  return new Response(null, {
    status: 302,
    headers: {
      location: link.target_url,
      'cache-control': 'no-store',
    },
  });
}
