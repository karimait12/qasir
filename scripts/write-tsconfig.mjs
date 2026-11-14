import { writeFileSync } from 'node:fs';

const tsconfig = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    noImplicitAny: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    isolatedModules: true,
    resolveJsonModule: true,
    verbatimModuleSyntax: true,
    exactOptionalPropertyTypes: true,
    noUncheckedIndexedAccess: true,
    noUncheckedSideEffectImports: true,
    noEmit: true,
    skipLibCheck: true,
    types: ['vite/client', 'node'],
  },
  include: ['src', 'api', 'vite.config.ts', 'vitest.config.ts'],
};

writeFileSync('tsconfig.json', `${JSON.stringify(tsconfig, null, 2)}\n`);
console.log('wrote tsconfig.json');
