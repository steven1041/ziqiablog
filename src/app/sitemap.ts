import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n';
import { categoryList } from '@/lib/categories';
import { getAllPostsMeta, getAllTags } from '@/lib/posts';

const SITE_BASE = 'https://ziqia.cc';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    routes.push({ url: `${SITE_BASE}/${locale}/`, lastModified: new Date() });
    routes.push({ url: `${SITE_BASE}/${locale}/categories/`, lastModified: new Date() });
    routes.push({ url: `${SITE_BASE}/${locale}/tags/`, lastModified: new Date() });
    routes.push({ url: `${SITE_BASE}/${locale}/about/`, lastModified: new Date() });
    for (const c of categoryList()) {
      routes.push({ url: `${SITE_BASE}/${locale}/categories/${c.id}/`, lastModified: new Date() });
    }
    const posts = await getAllPostsMeta(locale);
    for (const p of posts) {
      routes.push({
        url: `${SITE_BASE}/${locale}/posts/${p.slug}/`,
        lastModified: new Date(p.date),
      });
    }
    const tags = await getAllTags(locale);
    for (const tag of tags) {
      routes.push({ url: `${SITE_BASE}/${locale}/tags/${tag}/`, lastModified: new Date() });
    }
  }
  return routes;
}
