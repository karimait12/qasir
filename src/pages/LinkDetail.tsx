import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Link, useParams } from 'react-router-dom';
import StatsChart from '../components/StatsChart';
import { Skeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { getLink, updateLink } from '../lib/links';
import { getLinkStats } from '../lib/stats';
import {
  countryName,
  flagEmoji,
  formatDate,
  formatNumber,
  shortUrl,
} from '../lib/format';
import type { Bucket, Link as LinkRow, LinkStats } from '../lib/types';

function BreakdownCard({
  title,
  icon,
  buckets,
  formatValue,
  emptyText = 'No click data yet.',
}: {
  title: string;
  icon: React.ReactNode;
  buckets: Bucket[];
  formatValue?: (value: string) => string;
  emptyText?: string;
}) {
  const total = buckets.reduce((acc, b) => acc + b.count, 0);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {icon}
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {buckets.length > 0 ? `${buckets.length} items` : '0'}
          </span>
        </div>

        {buckets.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            {emptyText}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {buckets.map((bucket) => {
              const pct = total > 0 ? Math.round((bucket.count / total) * 100) : 0;
              const displayVal = formatValue ? formatValue(bucket.value) : bucket.value;

              return (
                <div key={bucket.value} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate pr-2 font-medium text-slate-700 dark:text-slate-300" title={bucket.value}>
                      {displayVal}
                    </span>
                    <span className="shrink-0 tabular-nums text-slate-500 dark:text-slate-400">
                      <strong className="font-semibold text-slate-800 dark:text-slate-200">{formatNumber(bucket.count)}</strong> ({pct}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LinkDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [link, setLink] = useState<LinkRow | null>(null);
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [days, setDays] = useState<7 | 30>(7);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getLink(id)
      .then((row) => {
        if (!active) return;
        setLink(row);
        if (!row) showToast('Link not found', 'error');
      })
      .catch((err: unknown) => {
        if (active) showToast(err instanceof Error ? err.message : 'Could not load the link', 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, showToast]);

  useEffect(() => {
    if (!link) return;
    let active = true;
    getLinkStats(link.id, link.click_count, days)
      .then((result) => {
        if (active) setStats(result);
      })
      .catch((err: unknown) => {
        if (active) showToast(err instanceof Error ? err.message : 'Could not load stats', 'error');
      });
    return () => {
      active = false;
    };
  }, [link, days, showToast]);

  const short = useMemo(() => (link ? shortUrl(link.code) : ''), [link]);

  useEffect(() => {
    if (!short) return;
    let active = true;
    QRCode.toDataURL(short, { margin: 1, width: 320 })
      .then((url) => {
        if (active) setQr(url);
      })
      .catch(() => {
        if (active) setQr(null);
      });
    return () => {
      active = false;
    };
  }, [short]);

  async function copyShortLink() {
    try {
      await navigator.clipboard.writeText(short);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  }

  async function toggleStatus() {
    if (!link) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateLink(link.id, { is_active: !link.is_active });
      setLink(updated);
      showToast(updated.is_active ? 'Link activated' : 'Link paused', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update link status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="mt-3 text-base font-semibold text-slate-800 dark:text-slate-200">
          This link does not exist
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          It may have been removed or you do not have permission to view it.
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500"
        >
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all links
        </Link>
      </div>

      {/* Main Header / Link Overview Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {link.title || `/${link.code}`}
              </h1>

              {isExpired ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Expired
                </span>
              ) : link.is_active ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  Paused
                </span>
              )}

              <button
                type="button"
                onClick={() => void toggleStatus()}
                disabled={isUpdatingStatus}
                className="text-xs font-medium text-slate-500 underline hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 ml-1"
              >
                {isUpdatingStatus ? 'Updating…' : link.is_active ? 'Pause routing' : 'Resume routing'}
              </button>
            </div>

            {/* Short link copy bar */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={short}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400"
              >
                <span>{short}</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              <button
                type="button"
                onClick={() => void copyShortLink()}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>

            {/* Destination Target and meta details */}
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-medium text-slate-400">Target:</span>
                <a
                  href={link.target_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="truncate text-slate-700 hover:text-indigo-600 hover:underline dark:text-slate-300 dark:hover:text-indigo-400"
                  title={link.target_url}
                >
                  {link.target_url}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                <span>Created {formatDate(link.created_at)}</span>
                {link.expires_at && (
                  <span>• Expires on {formatDate(link.expires_at)}</span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Action Panel */}
          {qr && (
            <div className="flex items-center gap-4 border-t border-slate-100 pt-4 lg:border-t-0 lg:border-l lg:border-slate-100 lg:pl-6 lg:pt-0 dark:border-slate-800">
              <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-white">
                <img src={qr} alt={`QR code for ${short}`} className="h-24 w-24 sm:h-28 sm:w-28" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Scan & Share
                </p>
                <a
                  href={qr}
                  download={`qasir-${link.code}.png`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick KPI Stats Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Clicks
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatNumber(stats?.total ?? link.click_count)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Lifetime traffic</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Last 24 Hours
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatNumber(stats?.last24h ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Recent velocity</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Window
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {days} Days
          </p>
          <p className="mt-1 text-xs text-slate-400">Analytics time range</p>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Unique Countries
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {formatNumber(stats?.uniqueCountries ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-400">Distinct origins</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mobile Share
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {stats?.mobileShare != null ? `${stats.mobileShare}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Of human clicks</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Avg Latency
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {stats?.avgLatency != null ? `${stats.avgLatency} ms` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-400">Edge response</p>
        </div>
      </div>

      {/* Interactive Daily Clicks Chart */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Traffic Over Time
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated click events excluding automated crawlers.
            </p>
          </div>

          <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs dark:border-slate-800 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setDays(7)}
              aria-pressed={days === 7}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                days === 7
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setDays(30)}
              aria-pressed={days === 30}
              className={`rounded-lg px-3 py-1 font-medium transition ${
                days === 30
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <StatsChart data={stats?.series ?? []} />
      </div>

      {/* Categorical Breakdown Grids */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BreakdownCard
          title="Top Countries"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          buckets={stats?.countries ?? []}
          formatValue={(value) => `${flagEmoji(value)} ${countryName(value)}`}
        />

        <BreakdownCard
          title="Devices"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
          buckets={stats?.devices ?? []}
          formatValue={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        />

        <BreakdownCard
          title="Browsers"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          }
          buckets={stats?.browsers ?? []}
        />

        <BreakdownCard
          title="Referrers"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
          buckets={stats?.referrers ?? []}
          formatValue={(value) => (value === 'direct' ? 'Direct / Bookmarks' : value)}
        />
      </div>
    </div>
  );
}
