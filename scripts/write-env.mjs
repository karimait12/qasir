import { writeFileSync } from 'node:fs';

const envExample = `# Server-only (used by /api/r.ts on Vercel). Never prefix with VITE_.
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Client (used by the browser). Safe to expose.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional base URL used to build displayed/copied short URLs and QR codes.
# Falls back to window.location.origin when empty.
VITE_SHORT_BASE_URL=
`;

writeFileSync('.env.example', envExample);
console.log('wrote .env.example');
