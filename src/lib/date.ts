import type { Locale } from './types';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(dateString: string, locale: Locale): string {
  const d = new Date(dateString + 'T00:00:00');
  if (isNaN(d.getTime())) return dateString;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (locale === 'cn') return `${y}年${m}月${day}日`;
  return `${MONTHS_EN[d.getMonth()]} ${parseInt(day, 10)}, ${y}`;
}
