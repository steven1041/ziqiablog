export type Locale = 'cn' | 'en';

export interface CategoryConfig {
  id: Category;
  label: Record<Locale, string>;
  color: string;
  bgColor: string;
  bgColorDark: string;
}

export interface PostMeta {
  slug: string;
  translationKey: string;
  title: string;
  date: string;        // ISO yyyy-mm-dd
  category: Category;
  tags: string[];
  readingTime: number;
  featured: boolean;
  excerpt: string;
  coverAlt?: string;
}

export interface Post extends PostMeta {
  locale: Locale;
  content: string;     // raw MDX body
}

export type Category =
  | 'frontend' | 'backend' | 'architecture'
  | 'devops' | 'ai' | 'life';