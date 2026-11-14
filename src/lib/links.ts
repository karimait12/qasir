import { apiFetch } from './api';
import { validateAlias, validateTargetUrl } from './validation';
import type { Link } from './types';

export interface CreateLinkInput {
  targetUrl: string;
  alias?: string | null;
  expiresAt?: string | null;
  title?: string | null;
}

export interface UpdateLinkInput {
  title?: string | null;
  is_active?: boolean;
  expires_at?: string | null;
}

export async function listLinks(): Promise<Link[]> {
  const data = await apiFetch<{ links: Link[] }>('/api/links');
  return data.links ?? [];
}

export async function getLink(id: string): Promise<Link | null> {
  const data = await apiFetch<{ link: Link }>(`/api/links?id=${encodeURIComponent(id)}`);
  return data.link ?? null;
}

export async function createLink(input: CreateLinkInput): Promise<Link> {
  const validated = validateTargetUrl(input.targetUrl, [window.location.hostname]);
  if (!validated.ok) throw new Error(validated.error);

  let alias = '';
  if (input.alias && input.alias.trim()) {
    const result = validateAlias(input.alias);
    if (!result.ok) throw new Error(result.error);
    alias = result.value;
  }

  const data = await apiFetch<{ link: Link }>('/api/links', {
    method: 'POST',
    body: JSON.stringify({
      target_url: validated.value,
      title: input.title?.trim() || null,
      alias: alias || null,
      expires_at: input.expiresAt || null,
    }),
  });
  if (!data.link) throw new Error('Could not create the link');
  return data.link;
}

export async function updateLink(id: string, patch: UpdateLinkInput): Promise<Link> {
  const data = await apiFetch<{ link: Link }>(`/api/links?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  if (!data.link) throw new Error('Could not update the link');
  return data.link;
}

export async function deleteLink(id: string): Promise<void> {
  await apiFetch<{ ok: boolean }>(`/api/links?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
