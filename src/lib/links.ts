import { supabase } from './supabase';
import { generateCode } from './codegen';
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
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Link[];
}

export async function getLink(id: string): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .maybeSingle<Link>();
  if (error) throw new Error(error.message);
  return data ?? null;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to create links');

  const maxAttempts = alias ? 1 : 5;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = alias || generateCode(7);
    const { data, error } = await supabase
      .from('links')
      .insert({
        user_id: user.id,
        code,
        target_url: validated.value,
        title: input.title?.trim() || null,
        expires_at: input.expiresAt || null,
      })
      .select('*')
      .single<Link>();

    if (!error && data) return data;

    if (error?.code === '23505') {
      if (alias) throw new Error('That alias is already taken');
      continue;
    }
    if (error?.message?.includes('link_limit_reached')) {
      throw new Error('You have reached the maximum of 100 links');
    }
    throw new Error(error?.message || 'Could not create the link');
  }

  throw new Error('Could not generate a unique code, please try again');
}

export async function updateLink(id: string, patch: UpdateLinkInput): Promise<Link> {
  const { data, error } = await supabase
    .from('links')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single<Link>();
  if (error || !data) throw new Error(error?.message || 'Could not update the link');
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  const { error } = await supabase.from('links').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
