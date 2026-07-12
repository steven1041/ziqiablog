import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import type { Category } from '@/lib/types';

const ICONS: Record<Category, React.ReactNode> = {
  'prompt-engineering':  <path d="M3 5h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3zM17 11l4 3-4 3z" />,
  'ai-coding-workflows': <path d="M8 3l-6 9 6 9m8-18l6 9-6 9M14 3l-4 18" />,
  'tooling':             <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1 .1-1.4z" />,
  'quality':             <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />,
  'cost-efficiency':     <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1H6.34c.12 2.19 1.76 3.42 3.66 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />,
  'real-world':          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />,
  'security':            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />,
  'team-collab':         <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
  'ai-news':             <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14H6v-2h5v2zm5-4H6v-2h10v2zm0-4H6V7h10v2z" />,
};

type Props = {
  category: Category;
  size?: number;
  label?: string;
  href?: string;
};

export function CategoryIcon({ category, size = 44, label, href }: Props) {
  const cfg = CATEGORIES[category];
  const icon = (
    <span
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, background: cfg.bgColor }}
    >
      <svg width={size*0.5} height={size*0.5} viewBox="0 0 24 24" fill={cfg.color}>
        {ICONS[category]}
      </svg>
    </span>
  );
  const content = label ? (
    <span className="flex flex-col items-center gap-1.5">
      {icon}
      <span className="text-xs font-medium text-on-surface-variant">{label}</span>
    </span>
  ) : icon;
  if (href) {
    return <Link href={href} className="transition-transform hover:scale-105">{content}</Link>;
  }
  return content;
}
