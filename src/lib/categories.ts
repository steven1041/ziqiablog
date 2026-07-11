import type { CategoryConfig, Category } from './types';

export const CATEGORIES: Record<Category, CategoryConfig> = {
  frontend:     { id: 'frontend',     label: { cn: '前端', en: 'Frontend' },     color: '#4285F4', bgColor: '#D3E3FD', bgColorDark: '#041E49' },
  backend:      { id: 'backend',      label: { cn: '后端', en: 'Backend' },      color: '#EA4335', bgColor: '#FCE8E6', bgColorDark: '#A50E0E' },
  architecture: { id: 'architecture', label: { cn: '系统架构', en: 'Architecture' }, color: '#34A853', bgColor: '#E6F4EA', bgColorDark: '#0D652D' },
  devops:       { id: 'devops',       label: { cn: 'DevOps', en: 'DevOps' },     color: '#F9AB00', bgColor: '#FEF7E0', bgColorDark: '#7A5A00' },
  ai:           { id: 'ai',           label: { cn: 'AI', en: 'AI' },             color: '#4285F4', bgColor: '#E8F0FE', bgColorDark: '#0B3D91' },
  life:         { id: 'life',         label: { cn: '生活随笔', en: 'Life' },      color: '#DA4335', bgColor: '#FCE8E6', bgColorDark: '#7A1410' },
};

export function isCategory(value: string): value is Category {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, value);
}

export function categoryList(): CategoryConfig[] {
  return Object.values(CATEGORIES);
}