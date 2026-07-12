import { promises as fs } from 'node:fs';
import path from 'node:path';
import { buildFeedForLocale } from '../src/lib/rss.ts';

const outDir = path.resolve(process.cwd(), 'out', 'feeds');
await fs.mkdir(outDir, { recursive: true });

const xml = await buildFeedForLocale('cn');
const file = path.join(outDir, 'feed-cn.xml');
await fs.writeFile(file, xml, 'utf8');
console.log(`[rss] wrote ${file} (${xml.length} bytes)`);
