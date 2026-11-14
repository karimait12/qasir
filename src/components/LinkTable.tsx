import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteLink, updateLink } from '../lib/links';
import { formatDate, formatNumber, shortUrl } from '../lib/format';
import type { Link as LinkRow } from '../lib/types';
import { useToast } from './Toast';

interface LinkTableProps {
  links: LinkRow[];
  onChanged: () => Promise<void> | void;
}

export default function LinkTable({ links, onChanged }: LinkTableProps) {
  const { showToast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function copyLink(row: LinkRow) {
    try {
      await navigator.clipboard.writeText(shortUrl(row.code));
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  }

  async function toggleActive(row: LinkRow) {
    setBusyId(row.id);
    try {
      await updateLink(row.id, { is_active: !row.is_active });
      await onChanged();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not update the link', 'error');
    } finally {
      setBusyId(null);
    }
  }

  async function removeLink(row: LinkRow) {
    const confirmed = window.confirm(
      `Delete ${shortUrl(row.code)}? This cannot be undone.`,
    );
    if (!confirmed) return;
    setBusyId(row.id);
    try {
      await deleteLink(row.id);
      showToast('Link deleted', 'success');
      await onChanged();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete the link', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (links.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
        <p className="font-medium text-slate-700 dark:text-slate-200">No links yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Create your first short link using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th scope="col" className="px-4 py-3">Short link</th>
            <th scope="col" className="px-4 py-3">Title</th>
            <th scope="col" className="px-4 py-3">Target</th>
            <th scope="col" className="px-4 py-3 text-right">Clicks</th>
            <th scope="col" className="px-4 py-3">Created</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {links.map((row) => {
            const short = shortUrl(row.code);
            return (
              <tr key={row.id} className="align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/dashboard/${row.id}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      /{row.code}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void copyLink(row)}
                      className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Copy
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {row.title || '—'}
                </td>
                <td className="max-w-[16rem] px-4 py-3">
                  <a
                    href={row.target_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block truncate text-slate-600 hover:underline dark:text-slate-400"
                    title={row.target_url}
                  >
                    {row.target_url}
                  </a>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatNumber(row.click_count)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {formatDate(row.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleActive(row)}
                      disabled={busyId === row.id}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        row.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {row.is_active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeLink(row)}
                      disabled={busyId === row.id}
                      className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
