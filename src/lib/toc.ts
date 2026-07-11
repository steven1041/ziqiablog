export interface TocItem { id: string; text: string; level: 2 | 3; }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/[\s]+/g, '-');
}

export function extractToc(mdContent: string): TocItem[] {
  const lines = mdContent.split('\n');
  const items: TocItem[] = [];
  let inFence = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const level = (m[1].length as 2 | 3);
    const text = m[2].trim();
    items.push({ id: slugify(text), text, level });
  }
  return items;
}
