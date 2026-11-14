// Vercel Edge runtime: Web standard Request/Response, no Node compat needed.
export const config = { runtime: 'edge' };

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const RESERVED_ALIASES = new Set([
  'api', 'app', 'admin', 'dashboard', 'login', 'logout', 'signup',
  'assets', 'static', 'favicon', 'robots', 'sitemap', 'health',
]);
const ALIAS_RE = /^[A-Za-z0-9_-]{3,32}$/;
const MAX_URL_LENGTH = 2048;

interface Link {
  id: string;
  user_id: string;
  code: string;
  target_url: string;
  title: string | null;
  is_active: boolean;
  expires_at: string | null;
  click_count: number;
  created_at: string;
}


function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]); const b = Number(v4[2]); const c = Number(v4[3]); const d = Number(v4[4]);
    if ([a, b, c, d].some((n) => n > 255)) return true;
    if (a === 0 || a === 127) return true;
    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }
  if (host === '::1' || host === '::') return true;
  if (/^f[cd][0-9a-f]{2}:/i.test(host)) return true;
  if (/^fe80:/i.test(host)) return true;
  return false;
}

function validateTargetUrl(input: string, ownHosts: string[] = []): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: 'URL is required' };
  if (trimmed.length > MAX_URL_LENGTH) return { ok: false, error: `URL is too long (max ${MAX_URL_LENGTH} characters)` };
  if (/^(javascript|data|file|vbscript):/i.test(trimmed)) return { ok: false, error: 'Only http and https URLs are allowed' };
  let url: URL;
  try { url = new URL(trimmed); } catch { return { ok: false, error: 'Invalid URL' }; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, error: 'Only http and https URLs are allowed' };
  if (!url.hostname) return { ok: false, error: 'Invalid URL' };
  if (isPrivateHost(url.hostname)) return { ok: false, error: 'Private, local and loopback hosts are not allowed' };
  const host = url.hostname.toLowerCase();
  for (const own of ownHosts) {
    const ownHost = own.toLowerCase();
    if (host === ownHost || host.endsWith(`.${ownHost}`)) return { ok: false, error: 'Cannot shorten a link to this site' };
  }
  return { ok: true, value: url.toString() };
}

function validateAlias(input: string): { ok: true; value: string } | { ok: false; error: string } {
  const alias = input.trim();
  if (alias.length < 4) return { ok: false, error: 'Alias must be at least 4 characters' };
  if (alias.length > 32) return { ok: false, error: 'Alias must be at most 32 characters' };
  if (!ALIAS_RE.test(alias)) return { ok: false, error: 'Alias may only contain letters, numbers, "-" and "_"' };
  if (RESERVED_ALIASES.has(alias.toLowerCase())) return { ok: false, error: 'That alias is reserved' };
  return { ok: true, value: alias };
}

function generateCode(length = 7): string {
  const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let out = '';
  while (out.length < length) {
    const bytes = new Uint8Array(length - out.length);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < 248) {
        out += BASE62.charAt(byte % 62);
        if (out.length === length) break;
      }
    }
  }
  return out;
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

function ownHosts(req: Request): string[] {
  const hosts = new Set<string>();
  const url = new URL(req.url);
  hosts.add(url.hostname);
  const forwarded = req.headers.get('x-forwarded-host');
  if (forwarded) hosts.add(forwarded.split(':')[0] ?? forwarded);
  const host = req.headers.get('host');
  if (host) hosts.add(host.split(':')[0] ?? host);
  return [...hosts].filter(Boolean);
}

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const text = await req.text();
    if (!text) return {};
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

export default async function handler(req: Request): Promise<Response> {
  const auth = await authenticate(req);
  if (!auth) return json(401, { error: 'Unauthorized' });
  const { userId, admin } = auth;

  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  // LIST / GET
  if (req.method === 'GET') {
    if (id) {
      const { data, error } = await admin
        .from('links')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) return json(500, { error: error.message });
      if (!data) return json(404, { error: 'Link not found' });
      return json(200, { link: data });
    }
    const { data, error } = await admin
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return json(500, { error: error.message });
    return json(200, { links: (data ?? []) as Link[] });
  }

  // CREATE
  if (req.method === 'POST') {
    const body = await readJson(req);
    const targetUrl = asString(body.target_url) ?? asString(body.targetUrl);
    if (!targetUrl) return json(400, { error: 'target_url is required' });

    const validated = validateTargetUrl(targetUrl, ownHosts(req));
    if (!validated.ok) return json(400, { error: validated.error });

    const aliasInput = asString(body.alias);
    let alias = '';
    if (aliasInput && aliasInput.trim()) {
      const aliasResult = validateAlias(aliasInput);
      if (!aliasResult.ok) return json(400, { error: aliasResult.error });
      alias = aliasResult.value;
    }

    const title = asString(body.title)?.trim() || null;
    const expiresRaw = asString(body.expires_at) ?? asString(body.expiresAt);
    const expiresAt = expiresRaw ? expiresRaw : null;
    if (expiresAt && Number.isNaN(Date.parse(expiresAt))) {
      return json(400, { error: 'Invalid expiration date' });
    }

    const maxAttempts = alias ? 1 : 5;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const code = alias || generateCode(7);
      const { data, error } = await admin
        .from('links')
        .insert({
          user_id: userId,
          code,
          target_url: validated.value,
          title,
          expires_at: expiresAt,
        })
        .select('*')
        .single();

      if (!error && data) return json(201, { link: data });

      if (error?.code === '23505') {
        if (alias) return json(409, { error: 'That alias is already taken' });
        continue;
      }
      if (error?.message?.includes('link_limit_reached')) {
        return json(400, { error: 'You have reached the maximum of 100 links' });
      }
      return json(500, { error: error?.message || 'Could not create the link' });
    }

    return json(500, { error: 'Could not generate a unique code, please try again' });
  }

  // UPDATE
  if (req.method === 'PATCH') {
    const body = await readJson(req);
    const linkId = id ?? asString(body.id);
    if (!linkId) return json(400, { error: 'id is required' });

    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = asString(body.title)?.trim() || null;
    if (body.is_active !== undefined) {
      const active = asBoolean(body.is_active);
      if (active === undefined) return json(400, { error: 'is_active must be a boolean' });
      patch.is_active = active;
    }
    if (body.expires_at !== undefined || body.expiresAt !== undefined) {
      const raw = asString(body.expires_at) ?? asString(body.expiresAt);
      if (raw === null || raw === '') {
        patch.expires_at = null;
      } else if (raw) {
        if (Number.isNaN(Date.parse(raw))) return json(400, { error: 'Invalid expiration date' });
        patch.expires_at = raw;
      }
    }

    if (Object.keys(patch).length === 0) {
      return json(400, { error: 'No fields to update' });
    }

    const { data, error } = await admin
      .from('links')
      .update(patch)
      .eq('id', linkId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) return json(500, { error: error.message });
    if (!data) return json(404, { error: 'Link not found' });
    return json(200, { link: data });
  }

  // DELETE
  if (req.method === 'DELETE') {
    const body = await readJson(req);
    const linkId = id ?? asString(body.id);
    if (!linkId) return json(400, { error: 'id is required' });

    const { error, count } = await admin
      .from('links')
      .delete({ count: 'exact' })
      .eq('id', linkId)
      .eq('user_id', userId);

    if (error) return json(500, { error: error.message });
    if (!count) return json(404, { error: 'Link not found' });
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed' });
}
