import { CATEGORIES } from '@/lib/categories';
import type { Category } from '@/lib/types';

const ICONS: Record<Category, React.ReactNode> = {
  frontend: <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />,
  backend: <path d="M20 6h-4V4l-2-2h-4l-2 2v2H4v14h16V6zm-6-2v2h-4V4h4z" />,
  architecture: <path d="M3 9h18v2H3zm0 4h12v2H3zm0 4h12v2H3zm14-4h4v8h-4z" />,
  devops: <path d="M12 2l3 6 6 .9-4.5 4.4 1 6.6L12 17l-5.5 2.9 1-6.6L3 8.9 9 8z" />,
  ai: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  life: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
};

export function CategoryIcon({ category, size = 44 }: { category: Category; size?: number }) {
  const cfg = CATEGORIES[category];
  return (
    <span
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, background: cfg.bgColor }}
    >
      <svg width={size*0.5} height={size*0.5} viewBox="0 0 24 24" fill={cfg.color}>
        {ICONS[category]}
      </svg>
    </span>
  );
}
