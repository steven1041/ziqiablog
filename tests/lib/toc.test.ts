import { describe, it, expect } from 'vitest';
import { extractToc } from '@/lib/toc';

describe('extractToc', () => {
  it('extracts h2 and h3 with slugified ids', () => {
    const md = `# Title\n\nIntro.\n\n## First Section\n\nText.\n\n### Sub A\n\n## Second Section\n`;
    expect(extractToc(md)).toEqual([
      { id: 'first-section', text: 'First Section', level: 2 },
      { id: 'sub-a', text: 'Sub A', level: 3 },
      { id: 'second-section', text: 'Second Section', level: 2 },
    ]);
  });

  it('ignores code fences containing hashes', () => {
    const md = '## Real\n\n```\n## Not a heading\n```\n\n## Also Real\n';
    expect(extractToc(md).map((i) => i.text)).toEqual(['Real', 'Also Real']);
  });

  it('returns empty for no headings', () => {
    expect(extractToc('just text')).toEqual([]);
  });
});
