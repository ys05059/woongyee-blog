/**
 * JSON-LD 구조화된 데이터 생성 유틸리티
 */

import { Post } from '@/lib/notion/types';
import { blogConfig } from '@/blog.config';

/**
 * Article 스키마 생성 (블로그 포스트)
 */
export function generateArticleJsonLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || `${blogConfig.blog.url}/og-image.png`,
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    author: {
      '@type': 'Person',
      name: blogConfig.author.name,
      email: blogConfig.author.email,
    },
    publisher: {
      '@type': 'Organization',
      name: blogConfig.blog.name,
      url: blogConfig.blog.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${blogConfig.blog.url}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };
}

/**
 * WebSite 스키마 생성 (홈페이지)
 */
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: blogConfig.blog.name,
    description: blogConfig.blog.description,
    url: blogConfig.blog.url,
    author: {
      '@type': 'Person',
      name: blogConfig.author.name,
      email: blogConfig.author.email,
    },
    inLanguage: blogConfig.blog.language,
  };
}

/**
 * BreadcrumbList 스키마 생성
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
