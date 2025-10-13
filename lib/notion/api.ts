/**
 * Notion API 함수들
 */

import { unstable_cache } from 'next/cache';
import { getNotionClient, getN2MClient, getDataSourceId } from './client';
import { parsePageToPost, parsePagesToPostMetas } from './parser';
import { Post, PostMeta, NotionQueryOptions, PaginatedPosts } from './types';
import { blogConfig } from '@/blog.config';
import readingTime from 'reading-time';
import { markdownToHtml } from '@/lib/utils/markdown';

/**
 * 발행된 포스트 목록 가져오기 (내부 함수)
 */
async function getPublishedPostsInternal(
  options: NotionQueryOptions = {}
): Promise<PostMeta[]> {
  try {
    const notion = getNotionClient();
    const dataSourceId = await getDataSourceId();

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: blogConfig.notion.propertyMapping.status,
        select: {
          equals: blogConfig.notion.publishedStatus,
        },
      },
      sorts: [
        {
          property: blogConfig.notion.propertyMapping.publishDate,
          direction: 'descending',
        },
      ],
      page_size: options.limit || 100,
    });

    // v5 API: results에는 pages와 data sources가 혼재될 수 있음
    // Page 객체만 필터링
    const pageResults = response.results.filter(
      (result): result is typeof result & { object: 'page' } =>
        'object' in result && result.object === 'page'
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts = parsePagesToPostMetas(pageResults as any);

    // 필터링
    let filteredPosts = posts;

    if (options.tag) {
      filteredPosts = filteredPosts.filter((post) =>
        post.tags.includes(options.tag!)
      );
    }

    if (options.category) {
      filteredPosts = filteredPosts.filter(
        (post) => post.category === options.category
      );
    }

    if (options.featured !== undefined) {
      filteredPosts = filteredPosts.filter(
        (post) => post.featured === options.featured
      );
    }

    return filteredPosts;
  } catch (error) {
    console.error('Error fetching published posts:', error);
    throw new Error('Failed to fetch published posts from Notion');
  }
}

/**
 * 발행된 포스트 목록 가져오기 (캐시 적용)
 * blog.config.ts의 revalidate.postList 값으로 자동 갱신
 */
export const getPublishedPosts = unstable_cache(
  getPublishedPostsInternal,
  ['published-posts'],
  {
    revalidate: blogConfig.revalidate.postList,
    tags: ['posts'],
  }
);

/**
 * Slug로 포스트 가져오기
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const notion = getNotionClient();
    const n2m = getN2MClient();
    const dataSourceId = await getDataSourceId();

    // Slug로 페이지 검색
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: blogConfig.notion.propertyMapping.slug,
            rich_text: {
              equals: slug,
            },
          },
          {
            property: blogConfig.notion.propertyMapping.status,
            select: {
              equals: blogConfig.notion.publishedStatus,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = response.results[0] as any;

    // Markdown 변환
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdBlocks);
    const markdownContent = mdString.parent || '';

    // HTML로 변환
    const htmlContent = await markdownToHtml(markdownContent);

    // Post 객체 생성
    const post = parsePageToPost(page, htmlContent);

    if (!post) return null;

    // 읽기 시간 계산 (원본 마크다운 기준)
    const { text } = readingTime(markdownContent);
    post.readingTime = text;

    return post;
  } catch (error) {
    console.error(`Error fetching post with slug "${slug}":`, error);
    return null;
  }
}

/**
 * 특정 태그의 포스트 가져오기
 */
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  return getPublishedPosts({ tag });
}

/**
 * 특정 카테고리의 포스트 가져오기
 */
export async function getPostsByCategory(category: string): Promise<PostMeta[]> {
  return getPublishedPosts({ category });
}

/**
 * Featured 포스트 가져오기
 */
export async function getFeaturedPosts(): Promise<PostMeta[]> {
  return getPublishedPosts({ featured: true });
}

/**
 * 모든 태그 목록 가져오기
 */
export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tagsSet = new Set<string>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * 모든 카테고리 목록 가져오기
 */
export async function getAllCategories(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const categoriesSet = new Set<string>();

  posts.forEach((post) => {
    if (post.category) categoriesSet.add(post.category);
  });

  return Array.from(categoriesSet).sort();
}

/**
 * 페이지네이션된 포스트 가져오기
 */
export async function getPaginatedPosts(
  page = 1,
  limit?: number
): Promise<PaginatedPosts> {
  const postsPerPage = limit || blogConfig.pagination.postsPerPage;
  const allPosts = await getPublishedPosts();

  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  const posts = allPosts.slice(startIndex, endIndex);
  const hasMore = endIndex < allPosts.length;

  return {
    posts,
    hasMore,
    total: allPosts.length,
  };
}

/**
 * 포스트 검색
 */
export async function searchPosts(query: string): Promise<PostMeta[]> {
  const allPosts = await getPublishedPosts();
  const lowercaseQuery = query.toLowerCase();

  return allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}

/**
 * 페이지 ID로 slug와 발행 상태 조회하기
 * Webhook에서 페이지 ID를 받아 해당 포스트의 slug와 발행 상태를 확인하는데 사용
 */
export async function getPostSlugByPageId(
  pageId: string
): Promise<{ slug: string; isPublished: boolean } | null> {
  try {
    const notion = getNotionClient();

    // 페이지 정보 가져오기
    const page = await notion.pages.retrieve({ page_id: pageId });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageWithProperties = page as any;

    // Status 속성 확인 (Published인지 체크)
    const statusProperty = pageWithProperties.properties[blogConfig.notion.propertyMapping.status];
    const status = statusProperty?.select?.name || '';
    const isPublished = status === blogConfig.notion.publishedStatus;

    console.log(`Page ${pageId}: Status = ${status}, Published = ${isPublished}`);

    // Slug 속성 추출
    const slugProperty = pageWithProperties.properties[blogConfig.notion.propertyMapping.slug];

    if (!slugProperty || slugProperty.type !== 'rich_text') {
      console.warn(`Page ${pageId} does not have a valid slug property`);
      return null;
    }

    const slug = slugProperty.rich_text?.[0]?.plain_text || null;

    if (!slug) {
      console.warn(`Page ${pageId} has empty slug`);
      return null;
    }

    return { slug, isPublished };
  } catch (error) {
    console.error(`Error fetching slug for page "${pageId}":`, error);
    return null;
  }
}
