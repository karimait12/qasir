import { writeFileSync } from 'node:fs';

const envExample = `# Server-only (used by /api/r.ts on Vercel). Never prefix with VITE_.
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Client (used by the browser). Safe to expose.
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
`;

writeFileSync('.env.example', envExample);
console.log('wrote .env.example');
