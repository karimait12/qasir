import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Link, useParams } from 'react-router-dom';
import StatsChart from '../components/StatsChart';
import { Skeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { getLink } from '../lib/links';
import { getLinkStats } from '../lib/stats';
import {
  countryName,
  flagEmoji,
  formatDate,
  formatNumber,
  shortUrl,
} from '../lib/format';
import type { Bucket, Link as LinkRow, LinkStats } from '../lib/types';

function Breakdown({
  title,
  buckets,
  formatValue,
}: {
  title: string;
  buckets: Bucket[];
  formatValue?: (value: string) => string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="text-sm font-semibold">{title}</h3>
      {buckets.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {buckets.map((bucket) => (
            <li key={bucket.value} className="flex items-center justify-between text-sm">
              <span className="truncate pr-2">
                {formatValue ? formatValue(bucket.value) : bucket.value}
              </span>
              <span className="tabular-nums text-slate-500">{formatNumber(bucket.count)}</span>
            </li>
          ))}
        </ul>
      )}
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
    QRCode.toDataURL(short, { margin: 1, width: 256 })
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!link) {
    return (
      <div className="space-y-2">
        <p className="text-slate-600 dark:text-slate-300">
          This link does not exist or you do not have access.
        </p>
        <Link to="/dashboard" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/dashboard" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← Back to dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {link.title || `/${link.code}`}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <a
              href={short}
              target="_blank"
              rel="noreferrer noopener"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {short}
            </a>
            <button
              type="button"
              onClick={() => void copyShortLink()}
              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Copy
            </button>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                link.is_active
                  ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {link.is_active ? 'Active' : 'Paused'}
            </span>
          </div>
          <p className="mt-1 max-w-xl truncate text-sm text-slate-500" title={link.target_url}>
            → {link.target_url}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Created {formatDate(link.created_at)}
            {link.expires_at ? ` · Expires ${formatDate(link.expires_at)}` : ''}
          </p>
        </div>

        {qr && (
          <div className="flex flex-col items-center gap-2">
            <img src={qr} alt={`QR code for ${short}`} className="h-32 w-32 rounded-lg bg-white p-1" />
            <a
              href={qr}
              download={`qasir-${link.code}.png`}
              className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Download PNG
            </a>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500">Total clicks</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {formatNumber(stats?.total ?? link.click_count)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-sm text-slate-500">Clicks in the last 24 hours</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {formatNumber(stats?.last24h ?? 0)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Clicks per day</h2>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setDays(7)}
              aria-pressed={days === 7}
              className={`rounded px-2 py-1 ${days === 7 ? 'bg-white font-medium shadow dark:bg-slate-700' : ''}`}
            >
              7 days
            </button>
            <button
              type="button"
              onClick={() => setDays(30)}
              aria-pressed={days === 30}
              className={`rounded px-2 py-1 ${days === 30 ? 'bg-white font-medium shadow dark:bg-slate-700' : ''}`}
            >
              30 days
            </button>
          </div>
        </div>
        <div className="mt-4">
          <StatsChart data={stats?.series ?? []} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Breakdown
          title="Top countries"
          buckets={stats?.countries ?? []}
          formatValue={(value) => `${flagEmoji(value)} ${countryName(value)}`}
        />
        <Breakdown title="Devices" buckets={stats?.devices ?? []} />
        <Breakdown title="Browsers" buckets={stats?.browsers ?? []} />
        <Breakdown
          title="Referrers"
          buckets={stats?.referrers ?? []}
          formatValue={(value) => (value === 'direct' ? 'Direct' : value)}
        />
      </div>
    </div>
  );
}
