# qasir

qasir is a minimal URL shortener with privacy-friendly click analytics. It
shortens links to a 7-character base62 code and records per-click country,
device, browser and referrer — without storing IP addresses, full user agents or
cookies.

<!-- TODO: screenshot -->

## Features

- Short links with auto-generated 7-character base62 codes or custom aliases.
- Redirects are fast 302 responses with `Cache-Control: no-store`.
- Click analytics: total, last 24 hours, daily chart (7 / 30 days), top
  countries with flags, devices, browsers and referrer hosts.
- QR code generation with PNG download.
- Email magic-link and GitHub OAuth sign-in via Supabase Auth.
- Protected dashboard with create form, link table, status toggle and delete.
- Dark / light theme and responsive, accessible UI.
- Row Level Security in Postgres; the service role key never reaches the browser.

## Architecture

```
Browser (Vite + React)
   |
   | Supabase JS client (anon key, RLS)  -->  Supabase (Auth + Postgres)
   |
   | fetch /api/*  (same origin)          -->  Vercel serverless
                                                 |
                                                 | service role key
                                                 v
                                              Supabase (Postgres)
Short link hit:  /abc1234  --rewrite-->  /api/r?code=abc1234  -->  302 redirect
```

The dashboard reads and writes through the Supabase client with RLS. A serverless
function is used only for the redirect, because it needs the service role key to
record clicks and must run on every short-link hit. URL validation, code
generation and user-agent parsing live in `src/lib` and are shared by the
frontend.

## Tech stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Frontend    | Vite, React, TypeScript, Tailwind CSS         |
| Routing     | react-router-dom                              |
| Charts      | recharts                                      |
| QR codes    | qrcode                                        |
| Auth / DB   | Supabase (Postgres + Auth, RLS)               |
| Backend     | Vercel serverless functions (`/api`)          |
| Testing     | Vitest                                        |

## Setup

### 1. Create a Supabase project

1. Create a project at https://supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`.
3. In Authentication, enable the Email (magic link) and GitHub providers.
4. Copy the project URL and the anon key.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values (names only are
listed here):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are server-only (Vercel env).
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are client-side.

### 3. Install and run

```
npm install
npm run dev
```

### 4. Deploy on Vercel

1. Import the repository in Vercel.
2. Add the four environment variables above in the project settings.
3. Deploy. Vercel picks up `vercel.json` for the redirect rewrite and SPA
   fallback.

## Redirect flow

1. A visitor opens `https://your-domain.com/abc1234`.
2. `vercel.json` rewrites it to `/api/r?code=abc1234`.
3. `/api/r.ts` looks up the code with the service role.
4. If the link is missing, inactive or expired, a 404 page is returned.
5. Otherwise the click is recorded (country from `x-vercel-ip-country`,
   device and browser from the user agent, referrer host only).
6. A 302 redirect to the target URL is returned with `Cache-Control: no-store`.
   The target is re-validated as `http(s)` before redirecting. If the click
   insert fails, the redirect still happens.

## Security and privacy

- Row Level Security is enabled on both `links` and `clicks`. Users can only
  read and manage their own links; clicks are readable only through the owning
  link.
- Clicks are written only by the server using the service role key, which is
  never exposed to the client.
- No IP addresses, full user-agent strings or cookies are stored. Only the
  country code, device family, browser family and referrer host.
- Bot traffic (matched by a small UA regex) is stored with device `bot` and
  does not increment `click_count`.
- Destination URLs are validated: only `http`/`https`, max 2048 characters,
  private/loopback hosts and the app's own domain are rejected, preventing
  redirect loops and SSRF-style abuse.
- Custom aliases are validated against a character rule, a minimum length and a
  reserved-word list.

## Limitations and future work

- Analytics are aggregated in the browser from the last 30 days of clicks.
- No per-user link limit beyond 100 (enforced in the database).
- No custom domains or team workspaces.
- No bulk import / export of links.

## License

MIT — see `LICENSE`.
