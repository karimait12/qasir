import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { session, loading } = useAuth();

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Short links with private, simple click analytics.
      </h1>
      <p className="max-w-xl text-slate-600 dark:text-slate-300">
        Create short links and see clicks, countries, devices and referrers — without
        storing IP addresses or cookies.
      </p>

      <div className="flex flex-col items-center gap-3">
        {session ? (
          <Link
            to="/dashboard"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
          >
            Go to your dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
          >
            Sign in to create links
          </Link>
        )}
        {!loading && !session && (
          <span className="text-sm text-slate-500">No IP addresses, no cookies.</span>
        )}
      </div>
    </section>
  );
}
