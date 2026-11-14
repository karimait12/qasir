import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
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

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'clicks_desc' | 'clicks_asc'>('created_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // QR Modal
  const [qrModalData, setQrModalData] = useState<{
    code: string;
    url: string;
    qrUrl: string | null;
  } | null>(null);

  async function openQrModal(row: LinkRow) {
    const fullUrl = shortUrl(row.code);
    try {
      const qrDataUrl = await QRCode.toDataURL(fullUrl, { margin: 1, width: 320 });
      setQrModalData({
        code: row.code,
        url: fullUrl,
        qrUrl: qrDataUrl,
      });
    } catch {
      showToast('Could not generate QR code', 'error');
    }
  }

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
      showToast(row.is_active ? 'Link paused' : 'Link activated', 'success');
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

  // Filtered and Sorted links
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.code.toLowerCase().includes(q) ||
          l.target_url.toLowerCase().includes(q) ||
          (l.title && l.title.toLowerCase().includes(q)),
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((l) => l.is_active);
    } else if (statusFilter === 'paused') {
      result = result.filter((l) => !l.is_active);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'clicks_desc':
          return b.click_count - a.click_count;
        case 'clicks_asc':
          return a.click_count - b.click_count;
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [links, searchQuery, statusFilter, sortBy]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedLinks = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return filteredLinks.slice(start, start + pageSize);
  }, [filteredLinks, activePage, pageSize]);

  if (links.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800/80">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
          No short links created yet
        </h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          Create your very first link above to start routing visitors and tracking detailed analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search, Filter, and Sort Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search links, title, URL…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                statusFilter === 'all'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              All ({links.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('active');
                setCurrentPage(1);
              }}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                statusFilter === 'active'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Active ({links.filter((l) => l.is_active).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('paused');
                setCurrentPage(1);
              }}
              className={`rounded-md px-2.5 py-1 font-medium transition ${
                statusFilter === 'paused'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Paused ({links.filter((l) => !l.is_active).length})
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="created_desc">Newest first</option>
            <option value="created_asc">Oldest first</option>
            <option value="clicks_desc">Most clicks</option>
            <option value="clicks_asc">Fewest clicks</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs dark:divide-slate-800">
            <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 sm:pl-6">
                  Short link & Destination
                </th>
                <th scope="col" className="px-3 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-right">
                  Clicks
                </th>
                <th scope="col" className="px-3 py-3.5">
                  Created
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedLinks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No links match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLinks.map((row) => {
                  const isBusy = busyId === row.id;
                  const isExpired = row.expires_at && new Date(row.expires_at) < new Date();

                  return (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                    >
                      {/* Short Link & Target */}
                      <td className="py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => void openQrModal(row)}
                            title="View QR Code"
                            className="mt-0.5 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:text-indigo-400"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                          </button>

                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/dashboard/${row.id}`}
                                className="font-semibold text-slate-900 hover:text-indigo-600 hover:underline dark:text-white dark:hover:text-indigo-400"
                              >
                                /{row.code}
                              </Link>
                              {row.title && (
                                <span className="truncate rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {row.title}
                                </span>
                              )}
                            </div>

                            <a
                              href={row.target_url}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500 hover:text-indigo-500 dark:text-slate-400"
                              title={row.target_url}
                            >
                              <span className="truncate">{row.target_url}</span>
                              <svg className="h-3 w-3 shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-3 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Expired
                          </span>
                        ) : row.is_active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Paused
                          </span>
                        )}
                      </td>

                      {/* Clicks */}
                      <td className="whitespace-nowrap px-3 py-4 text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                          {formatNumber(row.click_count)}
                          <span className="text-[10px] font-normal text-slate-400">clicks</span>
                        </span>
                      </td>

                      {/* Created */}
                      <td className="whitespace-nowrap px-3 py-4 text-slate-500 dark:text-slate-400">
                        <span>{formatDate(row.created_at)}</span>
                        {row.expires_at && (
                          <span className="block text-[10px] text-slate-400">
                            Exp: {formatDate(row.expires_at)}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Copy */}
                          <button
                            type="button"
                            onClick={() => void copyLink(row)}
                            title="Copy short link"
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* Analytics Detail Page Link */}
                          <Link
                            to={`/dashboard/${row.id}`}
                            title="View analytics & breakdown"
                            className="inline-flex items-center gap-1 rounded-lg border border-indigo-200/80 bg-indigo-50/60 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-100/70 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Stats</span>
                          </Link>

                          {/* Toggle Active / Pause */}
                          <button
                            type="button"
                            onClick={() => void toggleActive(row)}
                            disabled={isBusy}
                            title={row.is_active ? 'Pause link routing' : 'Resume link routing'}
                            className={`rounded-lg px-2 py-1 text-xs font-medium transition ${
                              row.is_active
                                ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/60'
                            }`}
                          >
                            {row.is_active ? 'Pause' : 'Activate'}
                          </button>

                          {/* Delete Link */}
                          <button
                            type="button"
                            onClick={() => void removeLink(row)}
                            disabled={isBusy}
                            title="Delete link"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-6 dark:border-slate-800/80 dark:bg-slate-950/40">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-700 dark:text-slate-200">{(activePage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {Math.min(activePage * pageSize, filteredLinks.length)}
              </span>{' '}
              of <span className="font-medium text-slate-700 dark:text-slate-200">{filteredLinks.length}</span> links
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                {activePage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage === totalPages}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Popup Modal */}
      {qrModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setQrModalData(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                QR Code for /{qrModalData.code}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                {qrModalData.url}
              </p>

              {qrModalData.qrUrl && (
                <div className="my-5 flex justify-center">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-md dark:border-slate-700 dark:bg-white">
                    <img
                      src={qrModalData.qrUrl}
                      alt={`QR Code for ${qrModalData.url}`}
                      className="h-52 w-52"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(qrModalData.url);
                      showToast('Copied to clipboard', 'success');
                    } catch {
                      showToast('Could not copy', 'error');
                    }
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Copy Link
                </button>
                {qrModalData.qrUrl && (
                  <a
                    href={qrModalData.qrUrl}
                    download={`qasir-${qrModalData.code}.png`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-500 shadow-sm"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PNG
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
