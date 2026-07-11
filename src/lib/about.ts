import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { Locale } from './types';

async function readAbout(locale: Locale): Promise<{ content: string } | null> {
  const file = path.join(process.cwd(), 'content', locale, 'about.mdx');
  try {
    const raw = await fs.readFile(file, 'utf8');
    return { content: matter(raw).content };
  } catch {
    return null;
  }
}

export async function getAbout(locale: Locale) {
  return readAbout(locale);
}
