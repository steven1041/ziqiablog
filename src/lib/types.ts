export type Locale = 'cn';

export interface CategoryConfig {
  id: Category;
  label: string;
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
  | 'prompt-engineering'
  | 'ai-coding-workflows'
  | 'tooling'
  | 'quality'
  | 'cost-efficiency'
  | 'real-world'
  | 'security'
  | 'team-collab'
  | 'ai-news';
