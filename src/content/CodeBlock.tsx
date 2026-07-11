import { getHighlighter } from 'shiki';
import { CopyButton } from '@/components/CopyButton';

const langs = ['ts','tsx','js','jsx','bash','json','css','html','md','rust','go','sql','yaml'];

const highlighterPromise = getHighlighter({
  themes: ['github-light','github-dark'],
  langs,
});

export async function CodeBlock({ code, lang = 'ts' }: { code: string; lang?: string }) {
  const highlighter = await highlighterPromise;
  const safeLang = langs.includes(lang) ? lang : 'ts';
  const light = highlighter.codeToHtml(code, { lang: safeLang, theme: 'github-light' });
  const dark = highlighter.codeToHtml(code, { lang: safeLang, theme: 'github-dark' });
  return (
    <div className="group relative my-6">
      <div className="shiki-light" dangerouslySetInnerHTML={{ __html: light }} />
      <div className="shiki-dark hidden" dangerouslySetInnerHTML={{ __html: dark }} />
      <CopyButton text={code} />
      <style>{`
        :root:not(.dark) .shiki-dark { display: none; }
        :root:not(.dark) .shiki-light { display: block; }
        .dark .shiki-dark { display: block; }
        .dark .shiki-light { display: none; }
      `}</style>
    </div>
  );
}
