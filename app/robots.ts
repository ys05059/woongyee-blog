/**
 * Robots.txt 생성
 */

import { MetadataRoute } from 'next';
import { blogConfig } from '@/blog.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/test/'],
    },
    sitemap: `${blogConfig.blog.url}/sitemap.xml`,
  };
}
