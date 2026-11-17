import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((value) => !value) };
}

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const { dark, toggle } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
  }

const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const columns = [
  {
    title: 'learn',
    links: [
      { label: 'the ai course', href: '#' },
      { label: 'archive', href: '#' },
      { label: 'media', href: '#' },
      { label: 'perks', href: '#' },
    ],
  },
  {
    title: 'connect',
    links: [
      { label: 'youtube', href: '#' },
      { label: 'instagram', href: '#' },
      { label: 'x (twitter)', href: '#' },
      { label: 'linkedin', href: '#' },
      { label: 'work with us', href: '#' },
    ],
  },
];
  const userEmail = user?.email ?? 'User';
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  return (
    <div className="relative flex min-h-screen flex-col text-slate-900 transition-colors duration-200 dark:text-slate-100">
      {/* Background visual ambience glow */}
      <div className="" />

      {!isDashboard && (
        <header className={`fixed top-0 inset-x-0 z-50 ${
        scrolled
          ? ' text-black shadow-md backdrop-blur-lg transition-all '
          : 'bg-transparent text-white'
      }`}>
        <div className="mx-auto flex h-16 w-full max-w-6xl text-center items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo & Badge */}
          <div className="flex items-center gap-6">
            <Link
              to={user ? '/dashboard' : '/'}
              className="group flex items-center gap-2.5 font-semibold tracking-tight transition"
            >
             
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Qasir
                </span>
              </div>
            </Link>
 </div>
            {/* Desktop Navigation Links */}
               {user && (
              <nav className="hidden items-center justify-center md:flex">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    ` px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 underline underline-offset-4'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 '
                    }`
                  }
                >
                  links
                </NavLink>
              </nav>
)
}
         

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-3 md:flex">
          

            {user ? (
              /* User Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/70 py-1 pl-1 pr-3 text-sm font-medium shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-semibold text-white shadow-sm">
                    {userInitials}
                  </div>
                  <span className="max-w-[140px] truncate text-slate-700 dark:text-slate-300">
                    {userEmail}
                  </span>
                  <svg
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/95 dark:ring-white/10">
                    <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800/70">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Signed in as</p>
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                        {userEmail}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Dashboard
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1 dark:border-slate-800/70">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#5b5bff] px-5 py-2 text-sm font-Inter text-white shadow-sm shadow-indigo-800/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/35 active:scale-[0.98]"
                >
                  Sign Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Panel */}
        {mobileMenuOpen && (
          <div className="border-b border-slate-200/80 bg-white/95 px-4 pb-5 pt-3 shadow-lg backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/95 md:hidden">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-semibold text-white">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {userEmail}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
      )}

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {!isDashboard && (
        <footer className="relative overflow-hidden bg-gradient-to-b from-[#fbfbfa] to-white">
          <div className="relative mx-auto max-w-5xl px-6 pt-10 pb-8 font-[Inter,sans-serif]">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              {columns.map((col) => (
                <div key={col.title}>
                  <h4 className="text-sm font-semibold text-neutral-900">{col.title}</h4>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-[15px] text-neutral-500 transition hover:text-neutral-900"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* about column */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-900">about</h4>
                <p className="mt-4 max-w-[240px] text-[15px] leading-relaxed text-neutral-500">
                  the practical ai newsletter for founders and business leaders, written by hand,
                  every thursday.
                </p>
              </div>
            </div>

            <p className="mt-16 text-center text-xs text-neutral-400">© 2026 AI with Remy</p>
          </div>
        </footer>
      )}
    </div>
  );
}
