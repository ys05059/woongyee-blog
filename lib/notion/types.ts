/**
 * Notion 관련 타입 정의
 */

import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

/**
 * 블로그 포스트 인터페이스
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  publishDate: string;
  tags: string[];
  category?: string;
  status: string;
  featured?: boolean;
  readingTime?: string;
}

/**
 * 포스트 메타데이터 (content 제외)
 */
export interface PostMeta {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishDate: string;
  tags: string[];
  category?: string;
  status: string;
  featured?: boolean;
  readingTime?: string;
}

/**
 * Notion 페이지 속성 타입 헬퍼
 */
export type NotionPage = PageObjectResponse;

/**
 * Notion 데이터베이스 필터 옵션
 */
export interface NotionQueryOptions {
  status?: string;
  tag?: string;
  category?: string;
  featured?: boolean;
  limit?: number;
  startCursor?: string;
}

/**
 * 페이지네이션 결과
 */
export interface PaginatedPosts {
  posts: PostMeta[];
  hasMore: boolean;
  nextCursor?: string;
  total?: number;
}
