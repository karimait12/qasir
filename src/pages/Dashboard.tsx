import { useCallback, useEffect, useState } from 'react';
import LinkForm from '../components/LinkForm';
import LinkTable from '../components/LinkTable';
import { LinkListSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { listLinks } from '../lib/links';
import type { Link as LinkRow } from '../lib/types';

export default function Dashboard() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      setLinks(await listLinks());
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not load your links', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your links</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create, manage and inspect your short links.
        </p>
      </div>

      <LinkForm
        onCreated={() => {
          showToast('Link created', 'success');
          void load();
        }}
      />

      {loading ? <LinkListSkeleton /> : <LinkTable links={links} onChanged={load} />}
    </div>
  );
}
