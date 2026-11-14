import { useState, type FormEvent } from 'react';
import { createLink } from '../lib/links';
import { useToast } from './Toast';

interface LinkFormProps {
  onCreated: () => void;
}

export default function LinkForm({ onCreated }: LinkFormProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createLink({
        targetUrl,
        title: title.trim() || null,
        alias: alias.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setTargetUrl('');
      setAlias('');
      setExpiresAt('');
      setTitle('');
      onCreated();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create the link';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
    >
      <div>
        <label htmlFor="target" className="block text-sm font-medium">
          Destination URL
        </label>
        <input
          id="target"
          type="url"
          required
          value={targetUrl}
          onChange={(event) => setTargetUrl(event.target.value)}
          placeholder="https://example.com/very/long/link"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Campaign name"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="alias" className="block text-sm font-medium">
            Custom alias <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="alias"
            type="text"
            value={alias}
            onChange={(event) => setAlias(event.target.value)}
            placeholder="my-link"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="expires" className="block text-sm font-medium">
            Expires <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="expires"
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {submitting ? 'Creating…' : 'Create short link'}
      </button>
    </form>
  );
}
