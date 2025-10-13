/**
 * Sitemap 생성
 * 빌드 타임에 정적 생성 + On-Demand Revalidation (Webhook 기반)
 */

import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/notion';
import { blogConfig } from '@/blog.config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  const baseUrl = blogConfig.blog.url;

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 블로그 포스트
  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}
