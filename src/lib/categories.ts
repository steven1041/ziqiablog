import type { CategoryConfig, Category } from './types';

export const CATEGORIES: Record<Category, CategoryConfig> = {
  'prompt-engineering':  { id: 'prompt-engineering',  label: '提示工程',   color: '#4285F4', bgColor: '#E8F0FE', bgColorDark: '#0B3D91' },
  'ai-coding-workflows': { id: 'ai-coding-workflows', label: 'AI 编码工作流', color: '#34A853', bgColor: '#E6F4EA', bgColorDark: '#0D652D' },
  'tooling':             { id: 'tooling',             label: '工具生态',   color: '#EA4335', bgColor: '#FCE8E6', bgColorDark: '#A50E0E' },
  'quality':             { id: 'quality',             label: '质量保障',   color: '#F9AB00', bgColor: '#FEF7E0', bgColorDark: '#7A5A00' },
  'cost-efficiency':     { id: 'cost-efficiency',     label: '成本与效率', color: '#1A73E8', bgColor: '#D3E3FD', bgColorDark: '#041E49' },
  'real-world':          { id: 'real-world',          label: '项目实践',   color: '#34A853', bgColor: '#E6F4EA', bgColorDark: '#0D652D' },
  'security':            { id: 'security',            label: '安全与合规', color: '#EA4335', bgColor: '#FCE8E6', bgColorDark: '#A50E0E' },
  'team-collab':         { id: 'team-collab',         label: '团队协作',   color: '#4285F4', bgColor: '#D3E3FD', bgColorDark: '#041E49' },
  'ai-news':             { id: 'ai-news',             label: '业界新闻',   color: '#F9AB00', bgColor: '#FEF7E0', bgColorDark: '#7A5A00' },
};

export function isCategory(value: string): value is Category {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, value);
}

export function categoryList(): CategoryConfig[] {
  return Object.values(CATEGORIES);
}
