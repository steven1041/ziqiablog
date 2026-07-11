import { execSync } from 'node:child_process';
import path from 'node:path';

const outDir = path.resolve(process.cwd(), 'out');
console.log(`[pagefind] indexing ${outDir} ...`);
execSync(`npx pagefind --site "${outDir}"`, { stdio: 'inherit' });
console.log('[pagefind] done.');
