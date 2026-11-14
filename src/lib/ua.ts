// Tiny user-agent parser. No external library.

export type Device = 'mobile' | 'tablet' | 'desktop' | 'bot';

const BOT_RE =
  /bot|crawler|spider|preview|headless|facebookexternalhit|slackbot|whatsapp/i;

export function isBot(userAgent: string): boolean {
  return BOT_RE.test(userAgent);
}

export function detectDevice(userAgent: string): Device {
  const ua = userAgent;
  if (!ua) return 'desktop';
  if (/ipad|tablet|kindle|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function detectBrowser(userAgent: string): string {
  const ua = userAgent;
  const candidates: ReadonlyArray<[string, RegExp]> = [
    ['Edge', /Edg\//],
    ['Opera', /OPR\/|Opera/],
    ['Chrome', /Chrome\/|CriOS\//],
    ['Firefox', /Firefox\/|FxiOS\//],
    ['Safari', /Safari\//],
    ['Internet Explorer', /MSIE |Trident\//],
  ];
  for (const [name, re] of candidates) {
    if (re.test(ua)) return name;
  }
  return 'Unknown';
}

/** Bots keep their detected browser family but get device = 'bot'. */
export function parseUserAgent(userAgent: string): {
  device: Device;
  browser: string;
} {
  const browser = detectBrowser(userAgent);
  const device: Device = isBot(userAgent) ? 'bot' : detectDevice(userAgent);
  return { device, browser };
}
