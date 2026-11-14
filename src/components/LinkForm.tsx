import { useState, type FormEvent } from 'react';
import QRCode from 'qrcode';
import { createLink } from '../lib/links';
import { useToast } from './Toast';
import { shortUrl } from '../lib/format';

interface LinkFormProps {
  onCreated: () => void;
}

export default function LinkForm({ onCreated }: LinkFormProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [title, setTitle] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state modal / preview
  const [createdResult, setCreatedResult] = useState<{
    short: string;
    code: string;
    qr: string | null;
  } | null>(null);

  const { showToast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const newLink = await createLink({
        targetUrl,
        title: title.trim() || null,
        alias: alias.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      const fullShort = shortUrl(newLink.code);
      let qrDataUrl: string | null = null;
      try {
        qrDataUrl = await QRCode.toDataURL(fullShort, { margin: 1, width: 256 });
      } catch {
        qrDataUrl = null;
      }

      setCreatedResult({
        short: fullShort,
        code: newLink.code,
        qr: qrDataUrl,
      });

      setTargetUrl('');
      setAlias('');
      setExpiresAt('');
      setTitle('');
      setIsAdvancedOpen(false);
      onCreated();
      showToast('Short link created successfully!', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create the link';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function copyCreatedLink() {
    if (!createdResult) return;
    try {
      await navigator.clipboard.writeText(createdResult.short);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-none">
      {/* Background ambient subtle gradient glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15" />

      <form onSubmit={handleSubmit} className="relative p-5 sm:p-6 space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </span>
              Create a new short link
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Transform any long destination URL into a memorable, trackable short link.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdvancedOpen((v) => !v)}
            className="self-start sm:self-auto text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isAdvancedOpen ? 'Hide options' : 'More options (alias, title, expiry)'}
          </button>
        </div>

        {/* Primary URL input bar with embedded submit button */}
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <input
              id="target"
              type="url"
              required
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              placeholder="https://example.com/very/long/destination/url"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !targetUrl.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3 text-sm font-medium text-white shadow-sm hover:from-indigo-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Creating…</span>
              </>
            ) : (
              <>
                <span>Shorten URL</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Collapsible advanced options */}
        {isAdvancedOpen && (
          <div className="grid gap-3 pt-2 sm:grid-cols-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Campaign / Title <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Summer Promo"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="alias" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Custom alias <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative mt-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-slate-400">
                  /
                </span>
                <input
                  id="alias"
                  type="text"
                  value={alias}
                  onChange={(event) => setAlias(event.target.value)}
                  placeholder="custom-slug"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-6 pr-3 text-xs text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expires" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Expiration date <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative mt-1">
                <input
                  id="expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Instant Success Result Preview Card */}
      {createdResult && (
        <div className="border-t border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800/80 dark:bg-slate-950/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {createdResult.qr && (
                <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-white">
                  <img
                    src={createdResult.qr}
                    alt="QR Code"
                    className="h-12 w-12"
                  />
                </div>
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Link Ready
                </span>
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {createdResult.short}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to share anywhere with real-time tracking
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void copyCreatedLink()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>

              {createdResult.qr && (
                <a
                  href={createdResult.qr}
                  download={`qasir-${createdResult.code}.png`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  QR Code
                </a>
              )}

              <button
                type="button"
                onClick={() => setCreatedResult(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                title="Dismiss"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
