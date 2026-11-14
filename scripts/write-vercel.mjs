import { writeFileSync } from 'node:fs';

const vercel = {
  rewrites: [
    { source: '/dashboard', destination: '/index.html' },
    { source: '/login', destination: '/index.html' },
    { source: '/:code([A-Za-z0-9_-]{3,32})', destination: '/api/r?code=:code' },
    { source: '/(.*)', destination: '/index.html' },
  ],
};

writeFileSync('vercel.json', `${JSON.stringify(vercel, null, 2)}\n`);
console.log('wrote vercel.json');
