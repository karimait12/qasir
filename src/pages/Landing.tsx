import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  const { session } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="relative overflow-hidden bg-transparent pb-16 font-sans text-[14px]">
      {/* Background glow effects - blurred radial gradient */}
      {/* Hero Section */}
      <div>
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-8 mt-[35] text-center sm:pt-14">
        {/* Modern Pill Badge */}


        {/* Hero Title */}
        <h1 className="hero-title">
          Short{' '}
          <span className="highlight">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            links
          </span>{' '}
          with anonymous analytics.
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
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r bg-[#5b5bff] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-600/35 active:scale-[0.98]"
            >
              <span>Go to your Dashboard</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r bg-[--btn] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-600/35 active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}

        </div>


      </section>
      </div>

      {/* 
      <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6">
        <div className="relative rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xl shadow-indigo-950/10 backdrop-blur sm:p-5 dark:border-slate-800/80 dark:bg-slate-900/90 dark:shadow-indigo-950/30">
         
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 hidden rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-500 sm:inline-block dark:bg-slate-800 dark:text-slate-400">
                qasir / overview
              </span>
            </div>

            
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
       */}

      <div className="mt-9 w-full bg-gradient-to-b from-transparent to-white to-5% pb-8">
        <section id="features" className="mx-auto mt-24 max-w-[1100px] px-6 text-center">
      
          <p className="mb-12 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Three steps to smarter links
          </p>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 items-start justify-items-center gap-10 md:grid-cols-3 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5b5bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="preview-icon"><path d="M11 14h10"/><path d="M16 4h2a2 2 0 0 1 2 2v1.344"/><path d="m17 18 4-4-4-4"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Paste a link</h3>
              <p className="mt-2 max-w-[260px] text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                Enter any long URL and optionally choose a custom alias.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5b5bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share preview-icon"><path d="M12 2v13"/><path d="m16 6-4-4-4 4"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Share it</h3>
              <p className="mt-2 max-w-[260px] text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                Copy your short link or download a QR code for print and digital use.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5b5bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-no-axes-combined preview-icon"><path d="M12 16v5"/><path d="M16 14.639V21"/><path d="M20 10.656V21"/><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/><path d="M4 18.463V21"/><path d="M8 14.656V21"/></svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">See anonymous stats</h3>
              <p className="mt-2 max-w-[260px] text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                Track clicks, countries, devices, and referrers without storing IP addresses.
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
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
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
    </div>
  );
}