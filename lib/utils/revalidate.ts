/**
 * ISR (Incremental Static Regeneration) 설정
 */

import { blogConfig } from '@/blog.config';

/**
 * 페이지별 revalidate 시간 (초)
 */
export const REVALIDATE_TIME = {
  /** 포스트 목록 페이지 */
  postList: blogConfig.revalidate.postList,

  /** 개별 포스트 페이지 */
  post: blogConfig.revalidate.posts,

  /** 홈페이지 */
  home: blogConfig.revalidate.postList,

  /** About 페이지 */
  about: false as const, // 정적 페이지
} as const;

/**
 * On-Demand Revalidation 트리거
 *
 * @param path - Revalidate할 경로
 * @param token - REVALIDATE_TOKEN 환경변수 값
 * @returns 성공 여부
 *
 * @example
 * ```typescript
 * await triggerRevalidation('/blog', process.env.REVALIDATE_TOKEN);
 * ```
 */
export async function triggerRevalidation(
  path: string,
  token?: string
): Promise<boolean> {
  if (!token && typeof window === 'undefined') {
    token = process.env.REVALIDATE_TOKEN;
  }

  if (!token) {
    console.error('REVALIDATE_TOKEN is not set');
    return false;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-token': token,
      },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      console.error(`Revalidation failed: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log('Revalidation successful:', data);
    return true;
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    return false;
  }
}

/**
 * 특정 태그로 캐시된 데이터 revalidation
 */
export async function triggerRevalidationByTag(
  tag: string,
  token?: string
): Promise<boolean> {
  if (!token && typeof window === 'undefined') {
    token = process.env.REVALIDATE_TOKEN;
  }

  if (!token) {
    console.error('REVALIDATE_TOKEN is not set');
    return false;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BLOG_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-token': token,
      },
      body: JSON.stringify({ tag }),
    });

    if (!response.ok) {
      console.error(`Revalidation failed: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log('Revalidation successful:', data);
    return true;
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    return false;
  }
}
