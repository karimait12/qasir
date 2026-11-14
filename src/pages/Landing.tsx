import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How does privacy-first click analytics work?',
    answer:
      'We never collect, store, or log any visitor IP addresses or set tracking cookies. Our analytics engine aggregates anonymized referrers, geo-regions at country/coarse level, and user-agent device types in compliance with GDPR and CCPA out-of-the-box.',
  },
  {
    question: 'Can I use custom slugs or branded links?',
    answer:
      'Yes! You can choose custom back-halves for any link (e.g. qasir.link/launch-day) or let our fast collision-free generator create sleek, compact shortcodes automatically.',
  },
  {
    question: 'Is QR code generation included for all links?',
    answer:
      'Every short URL you create automatically includes downloadable high-resolution SVG and PNG QR codes, perfect for packaging, print flyers, slide decks, and digital displays.',
  },
  {
    question: 'Are there click limits or surprise paywalls?',
    answer:
      'All basic tiers feature generous redirect volumes with zero rate-throttling on live traffic. Your links remain fast, resilient, and always accessible worldwide via edge distribution.',
  },
];

export default function Landing() {
  const { session, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'geography' | 'referrers'>('overview');

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative overflow-hidden pb-16">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-sky-400/20 to-purple-500/20 blur-3xl dark:from-indigo-600/15 dark:via-cyan-500/10 dark:to-purple-800/15" />

      {/* Hero Section */}
      <section className="mx-auto flex max-w-4xl flex-col items-center pt-8 text-center sm:pt-14">
        {/* Modern Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur transition hover:border-indigo-300 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Privacy-Centric Link Intelligence</span>
          <span className="text-indigo-400 dark:text-indigo-600">•</span>
          <span className="font-normal text-slate-600 dark:text-slate-300">Zero Cookies & Zero Tracking</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-7 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          Short links with{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-sky-300 dark:to-indigo-300">
            pure, private
          </span>{' '}
          analytics.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          Supercharge your marketing and developer workflows. Create branded short links, monitor real-time conversions,
          and explore deep analytics without ever harvesting visitor personal data.
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
              GDPR & CCPA Compliant
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant QR Generation
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Global Edge Redirects
            </span>
          </div>
        )}
      </section>

      {/* Interactive Mock Dashboard / Analytics Preview */}
      <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xl shadow-indigo-950/10 backdrop-blur sm:p-5 dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-indigo-950/30">
          {/* Mock Browser Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 hidden rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-500 sm:inline-block dark:bg-slate-800 dark:text-slate-400">
                qasir.app/analytics/campaign-2026
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

          {/* Quick Stats Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Clicks</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">48,219</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+24.3%</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Unique Countries</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">114</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+12</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Mobile Share</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">68.4%</span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Desktop 31.6%</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/50">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Latency</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">14ms</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Edge Cached</span>
              </div>
            </div>
          </div>

          {/* Dynamic Mock Visual Area */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50/40 to-slate-100/40 p-4 dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-900/40">
            {activeTab === 'overview' && (
              <div>
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Clicks over last 7 days</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Peak: 9,410 / day</span>
                </div>
                {/* Visual Bar representation */}
                <div className="flex h-36 items-end justify-between gap-2 pt-4 sm:gap-4">
                  {[
                    { day: 'Mon', h: '45%', count: '4.5k' },
                    { day: 'Tue', h: '60%', count: '6.1k' },
                    { day: 'Wed', h: '78%', count: '7.8k' },
                    { day: 'Thu', h: '92%', count: '9.2k' },
                    { day: 'Fri', h: '98%', count: '9.4k' },
                    { day: 'Sat', h: '55%', count: '5.5k' },
                    { day: 'Sun', h: '62%', count: '5.7k' },
                  ].map((bar) => (
                    <div key={bar.day} className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                      <div className="text-[10px] font-mono text-slate-400 opacity-0 transition group-hover:opacity-100 dark:text-slate-500">
                        {bar.count}
                      </div>
                      <div
                        style={{ height: bar.h }}
                        className="w-full max-w-[48px] rounded-t-lg bg-gradient-to-t from-indigo-600 to-sky-400 transition-all duration-300 group-hover:from-indigo-500 group-hover:to-sky-300"
                      />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'geography' && (
              <div className="space-y-3 py-1">
                {[
                  { country: 'United States', flag: '🇺🇸', percent: 42, count: '20,251 clicks' },
                  { country: 'Germany', flag: '🇩🇪', percent: 18, count: '8,679 clicks' },
                  { country: 'United Kingdom', flag: '🇬🇧', percent: 14, count: '6,750 clicks' },
                  { country: 'Japan', flag: '🇯🇵', percent: 9, count: '4,339 clicks' },
                ].map((item) => (
                  <div key={item.country} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <span>{item.flag}</span>
                        <span>{item.country}</span>
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{item.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'referrers' && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 py-1">
                {[
                  { domain: 'twitter.com / X', icon: '🐦', hits: '18,420', share: '38.2%' },
                  { domain: 'github.com', icon: '🐙', hits: '12,980', share: '26.9%' },
                  { domain: 'linkedin.com', icon: '💼', hits: '9,114', share: '18.9%' },
                  { domain: 'Direct / Email / QR', icon: '⚡', hits: '7,705', share: '16.0%' },
                ].map((source) => (
                  <div
                    key={source.domain}
                    className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{source.icon}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{source.domain}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{source.hits}</div>
                      <div className="text-[10px] text-slate-400">{source.share}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="mx-auto mt-24 max-w-5xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Engineered for Modern Teams
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Everything you need. Nothing you don't.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            Designed from day one to balance actionable link intelligence with uncompromising user privacy.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Zero-Trace Privacy</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              No tracking cookies, no fingerprinting scripts, and zero IP address logging. Peace of mind for both you and your visitors.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-950/80 dark:text-sky-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Sub-Millisecond Redirects</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Distributed edge redirects dispatch users to destination URLs in record time with minimal network hops.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/80 dark:text-emerald-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Built-in QR Engine</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              High fidelity QR code generation on the fly. Download customized vectors ready for flyers, merch, and packaging.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-950/80 dark:text-purple-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Clean Visual Metrics</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Get actionable clarity with interactive timeline charts, device distribution, and top traffic referrers in one view.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950/80 dark:text-amber-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Custom Slugs</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Customize link aliases to strengthen your brand recall and improve organic click-through rates effortlessly.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-700">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-950/80 dark:text-rose-300">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">Developer Friendly</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Built on clean modern standards with Supabase authentication, strict typing, and instant magic link sign-in.
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
            Have questions about privacy, analytics, or links? Here are the answers.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/60 transition dark:border-slate-800 dark:bg-slate-900/60"
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
                  <div className="border-t border-slate-100 px-5 py-3.5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
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

          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to shorten smarter?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-100 sm:text-base">
            Start creating privacy-first short links in less than 30 seconds. No credit card required.
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
