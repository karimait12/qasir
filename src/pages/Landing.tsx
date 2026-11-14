import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOverviewStats } from '../hooks/useOverviewStats';
import { countryName, flagEmoji } from '../lib/format';
import { barHeightPercent, deltaPercent, isAllZero, mobileSharePercent, peakClicks, weekdayLabel } from '../lib/overview';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does anonymous click analytics work?',
    answer:
      'We never collect, store, or log any visitor IP addresses or set tracking cookies. Our analytics engine aggregates anonymized referrers, geo-regions at country level, and user-agent device types.',
  },
  {
    question: 'Can I use custom slugs or branded links?',
    answer:
      'Yes! You can choose custom back-halves for any link (e.g. qasir.link/launch-day) or let our generator create compact shortcodes automatically.',
  },
  {
    question: 'Is QR code generation included for all links?',
    answer:
      'Every short URL you create automatically includes downloadable QR codes in PNG format, ready for print, packaging, and digital displays.',
  },
  {
    question: 'Are there click limits or surprise paywalls?',
    answer:
      'All basic tiers feature generous redirect volumes with no rate-throttling on live traffic. Your links remain fast and always accessible worldwide.',
  },
];

export default function Landing() {
  const { session, loading } = useAuth();
  const { data: overview, loading: overviewLoading, error: overviewError } = useOverviewStats();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'geography' | 'referrers'>('overview');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const topCountry = overview?.countries[0];

  return (
    <div className="relative overflow-hidden pb-16 font-sans text-[14px]">
      {/* Background glow effects - blurred radial gradient */}
      {/* Hero Section */}
      <section className="mx-auto flex max-w-4xl flex-col items-center pt-8 text-center sm:pt-14">
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur transition hover:border-indigo-300 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Anonymous Analytics</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          Short links with{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-sky-300 dark:to-indigo-300">
            anonymous
          </span>{' '}
          analytics.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          Create short links and track clicks without storing visitor IP addresses or setting cookies.
          See where your traffic comes from with anonymous, aggregate analytics.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
          {session ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-600/35 active:scale-[0.98]"
            >
              <span>Go to your Dashboard</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-600/35 active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}

          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-medium text-slate-700 backdrop-blur transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          >
            Explore Features
          </a>
        </div>

        {/* Trust Badges */}
        {!loading && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No IP addresses stored
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Fast redirects
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Custom aliases & QR codes
            </span>
          </div>
        )}
      </section>

      {/* Live Analytics Preview */}
      <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xl shadow-indigo-950/10 backdrop-blur sm:p-5 dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-indigo-950/30">
          {/* Mock Browser Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 hidden rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-500 sm:inline-block dark:bg-slate-800 dark:text-slate-400">
                qasir / overview
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`rounded-md px-3 py-1 transition ${
                  activeTab === 'overview'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Traffic
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('geography')}
                className={`rounded-md px-3 py-1 transition ${
                  activeTab === 'geography'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Countries
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('referrers')}
                className={`rounded-md px-3 py-1 transition ${
                  activeTab === 'referrers'
                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Sources
              </button>
            </div>
          </div>

          {overviewError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">Stats unavailable</p>
          )}

          {overviewLoading && !overview && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {overview && (
            <>
              {/* Quick Stats Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Clicks</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{overview.totalClicks.toLocaleString()}</span>
                    {deltaPercent(overview.totalClicks, overview.previousTotalClicks) !== null && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        +{deltaPercent(overview.totalClicks, overview.previousTotalClicks)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Unique Countries</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{overview.uniqueCountries}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Mobile Share</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {(() => {
                        const mobileShare = mobileSharePercent(
                          overview.devices.mobile,
                          overview.devices.desktop,
                          overview.devices.tablet,
                        );
                        return mobileShare !== null ? `${mobileShare}%` : '-';
                      })()}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Country</div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {topCountry ? `${flagEmoji(topCountry.country)} ${countryName(topCountry.country)}` : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Visual Area */}
              <div className="mt-4 rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/40 to-slate-100/40 p-4 dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-900/40">
                {activeTab === 'overview' && (
                  <div>
                    <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Clicks over last 7 days</span>
                      {!isAllZero(overview.daily) && (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          Peak: {peakClicks(overview.daily)} / day
                        </span>
                      )}
                    </div>
                    {isAllZero(overview.daily) ? (
                      <p className="py-8 text-center text-xs text-slate-400">No clicks yet. Create a link and open it to see stats here.</p>
                    ) : (
                      <div className="flex h-36 items-end justify-between gap-2 pt-4 sm:gap-4">
                        {overview.daily.map((d) => {
                          const max = Math.max(...overview.daily.map((x) => x.clicks), 1);
                          return (
                            <div key={d.day} className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end" title={`${d.clicks}`}>
                              <div className="text-[10px] font-mono text-slate-400 opacity-0 transition group-hover:opacity-100 dark:text-slate-500">
                                {d.clicks}
                              </div>
                              <div
                                style={{ height: `${barHeightPercent(d.clicks, max)}%` }}
                                className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-sky-400 transition-all duration-300 group-hover:from-indigo-500 group-hover:to-sky-300"
                              />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {weekdayLabel(d.day)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'geography' && (
                  <div className="space-y-3 py-1">
                    {overview.countries.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400">No clicks yet. Create a link and open it to see stats here.</p>
                    ) : (
                      overview.countries.map((item) => {
                        const total = overview.countries.reduce((a, b) => a + b.clicks, 0) || 1;
                        const pct = Math.round((item.clicks / total) * 100);
                        return (
                          <div key={item.country} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                <span>{flagEmoji(item.country)}</span>
                                <span>{countryName(item.country)}</span>
                              </span>
                              <span className="font-mono text-slate-500 dark:text-slate-400">{item.clicks}</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeTab === 'referrers' && (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 py-1">
                    {overview.referrers.length === 0 ? (
                      <p className="py-8 text-center text-xs text-slate-400 col-span-full">No clicks yet. Create a link and open it to see stats here.</p>
                    ) : (
                      overview.referrers.map((source) => (
                        <div
                          key={source.host}
                          className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">🔗</span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {source.host === 'Direct' ? 'Direct / Email / QR' : source.host}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{source.clicks}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            {session ? 'Your last 7 days' : 'Live totals across all Qasir links'}
          </p>
        </div>
      </section>

      {/* How it works - 3 steps */}
      <section id="features" className="mx-auto mt-24 max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            How it works
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Three steps to smarter links
          </p>
        </div>

        {/* 3 Steps */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-300/80 bg-white/70 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Paste a link</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Enter any long URL and optionally choose a custom alias.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-300/80 bg-white/70 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/80 dark:text-sky-300">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Share it</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Copy your short link or download a QR code for print and digital use.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-300/80 bg-white/70 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">See anonymous stats</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Track clicks, countries, devices, and referrers without storing IP addresses.
            </p>
          </div>
        </div>

        {/* 3 Feature Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="group rounded-2xl border border-slate-300/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Custom aliases</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Choose your own short link slug to strengthen brand recall.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-300/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-950/80 dark:text-sky-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">QR codes</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Download QR codes for every link, ready for print and digital use.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-300/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/80 dark:text-emerald-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Anonymous analytics</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Track clicks, countries, devices, and referrers. No IP addresses stored, no cookies for visitors.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto mt-24 max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Have questions about analytics or links? Here are the answers.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-slate-300/80 bg-white/60 transition dark:border-slate-700 dark:bg-slate-900/60"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-slate-900 transition hover:bg-slate-50/50 dark:text-white dark:hover:bg-slate-800/40"
                >
                  <span className="text-sm font-semibold">{faq.question}</span>
                  <svg
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-3.5 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Box */}
      <section className="mx-auto mt-20 max-w-4xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 px-6 py-12 text-center text-white shadow-xl shadow-indigo-500/20 sm:px-12">
          {/* Subtle decoration */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-900/30 blur-2xl" />

          <h2 className="text-3xl font-extrabold leading-[1.1] sm:text-4xl">Ready to shorten smarter?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-100 sm:text-base">
            Start creating short links in less than 30 seconds. No credit card required.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={session ? '/dashboard' : '/login'}
              className="rounded-xl bg-white px-7 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-slate-100 active:scale-95"
            >
              {session ? 'Go to your Dashboard' : 'Create Free Account'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}