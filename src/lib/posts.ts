import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Category, Locale, Post, PostMeta } from './types';
import { isCategory, categoryList } from './categories';

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), 'content');
let CONTENT_DIR = DEFAULT_CONTENT_DIR;

export function setPostsDirForTest(dir: string) {
  CONTENT_DIR = dir;
}

function postsDir(locale: Locale): string {
  return path.join(CONTENT_DIR, locale, 'posts');
}

async function listMdxFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith('.mdx'))
      .map((e) => path.join(dir, e.name));
  } catch {
    return [];
  }
}

async function readPostFile(file: string, locale: Locale): Promise<Post | null> {
  const raw = await fs.readFile(file, 'utf8');
  const { data, content } = matter(raw);
  const slug = String(data.slug ?? path.basename(file, '.mdx'));
  const categoryRaw = String(data.category ?? '');
  if (!isCategory(categoryRaw)) {
    throw new Error(`Invalid category "${categoryRaw}" in ${file}`);
  }
  return {
    slug,
    translationKey: String(data.translationKey ?? slug),
    title: String(data.title ?? slug),
    date: String(data.date ?? ''),
    category: categoryRaw as Category,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: Math.max(1, Math.round(readingTime(content).minutes)),
    featured: Boolean(data.featured ?? false),
    excerpt: String(data.excerpt ?? ''),
    coverAlt: data.coverAlt ? String(data.coverAlt) : undefined,
    locale,
    content,
  };
}

export async function getPost(locale: Locale, slug: string): Promise<Post | null> {
  const files = await listMdxFiles(postsDir(locale));
  for (const file of files) {
    const post = await readPostFile(file, locale);
    if (post && post.slug === slug) return post;
  }
  return null;
}

export async function getAllPosts(locale: Locale): Promise<Post[]> {
  const files = await listMdxFiles(postsDir(locale));
  const posts = await Promise.all(files.map((f) => readPostFile(f, locale)));
  return posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function toMeta(post: Post): PostMeta {
  const { content, locale, ...meta } = post;
  return meta;
}

export async function getAllPostsMeta(locale: Locale): Promise<PostMeta[]> {
  return (await getAllPosts(locale)).map(toMeta);
}

export async function getFeatured(locale: Locale): Promise<PostMeta | null> {
  const all = await getAllPostsMeta(locale);
  return all.find((p) => p.featured) ?? (all[0] ?? null);
}

export async function getPostsByCategory(locale: Locale, category: Category): Promise<PostMeta[]> {
  return (await getAllPostsMeta(locale)).filter((p) => p.category === category);
}

export async function getPostsByTag(locale: Locale, tag: string): Promise<PostMeta[]> {
  return (await getAllPostsMeta(locale)).filter((p) => p.tags.includes(tag));
}

export async function getAllTags(locale: Locale): Promise<string[]> {
  const posts = await getAllPostsMeta(locale);
  return Array.from(new Set(posts.flatMap((p) => p.tags)));
}

export async function getTranslation(targetLocale: Locale, translationKey: string): Promise<PostMeta | null> {
  const all = await getAllPostsMeta(targetLocale);
  return all.find((p) => p.translationKey === translationKey) ?? null;
}

export async function getAllSlugs(locale: Locale): Promise<string[]> {
  return (await getAllPostsMeta(locale)).map((p) => p.slug);
}

export async function getPostsCountPerCategory(locale: Locale): Promise<Record<Category, number>> {
  const all = await getAllPostsMeta(locale);
  const counts = {} as Record<Category, number>;
  categoryList().forEach((c) => (counts[c.id] = 0));
  all.forEach((p) => { counts[p.category] = (counts[p.category] ?? 0) + 1; });
  return counts;
}