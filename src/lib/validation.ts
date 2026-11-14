// Pure URL/alias validation helpers. No side effects, safe to unit test.

export const MAX_URL_LENGTH = 2048;
export const ALIAS_RE = /^[A-Za-z0-9_-]{3,32}$/;

export const RESERVED_ALIASES: ReadonlySet<string> = new Set([
  'api',
  'app',
  'admin',
  'dashboard',
  'login',
  'logout',
  'signup',
  'assets',
  'static',
  'favicon',
  'robots',
  'sitemap',
  'health',
]);

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function isHttpUrl(input: string): boolean {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Reject loopback, link-local and RFC1918 private hosts so users cannot create
 * links that point at internal infrastructure.
 */
export function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host) return true;

  if (host === 'localhost' || host.endsWith('.localhost')) return true;

  // IPv4 literal
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    const c = Number(v4[3]);
    const d = Number(v4[4]);
    if ([a, b, c, d].some((n) => n > 255)) return true;
    if (a === 0 || a === 127) return true;
    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true; // link-local
    return false;
  }

  // IPv6 loopback / unique-local / link-local
  if (host === '::1' || host === '::') return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(host)) return true;
  if (/^fe80:/i.test(host)) return true;

  return false;
}

/**
 * Validate a user-supplied destination URL. `ownHosts` prevents redirect loops
 * by rejecting the app's own domain.
 */
export function validateTargetUrl(
  input: string,
  ownHosts: string[] = [],
): ValidationResult<string> {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'URL is required' };
  if (trimmed.length > MAX_URL_LENGTH) {
    return { ok: false, error: `URL is too long (max ${MAX_URL_LENGTH} characters)` };
  }
  if (/^(javascript|data|file|vbscript):/i.test(trimmed)) {
    return { ok: false, error: 'Only http and https URLs are allowed' };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, error: 'Invalid URL' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, error: 'Only http and https URLs are allowed' };
  }
  if (!url.hostname) return { ok: false, error: 'Invalid URL' };
  if (isPrivateHost(url.hostname)) {
    return { ok: false, error: 'Private, local and loopback hosts are not allowed' };
  }

  const host = url.hostname.toLowerCase();
  for (const own of ownHosts) {
    const ownHost = own.toLowerCase();
    if (host === ownHost || host.endsWith(`.${ownHost}`)) {
      return { ok: false, error: 'Cannot shorten a link to this site' };
    }
  }

  return { ok: true, value: url.toString() };
}

export function validateAlias(input: string): ValidationResult<string> {
  const alias = input.trim();
  if (alias.length < 4) return { ok: false, error: 'Alias must be at least 4 characters' };
  if (alias.length > 32) return { ok: false, error: 'Alias must be at most 32 characters' };
  if (!ALIAS_RE.test(alias)) {
    return { ok: false, error: 'Alias may only contain letters, numbers, "-" and "_"' };
  }
  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    return { ok: false, error: 'That alias is reserved' };
  }
  return { ok: true, value: alias };
}
