/**
 * Notion 데이터 파싱 유틸리티
 */

import {
  PageObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { blogConfig } from '@/blog.config';
import { Post, PostMeta } from './types';
import { uploadCoverImage } from '@/lib/cloudinary/upload';

/**
 * Notion 페이지 속성에서 텍스트 추출
 */
function getPlainText(property: PageObjectResponse['properties'][string]): string {
  if (!property) return '';

  switch (property.type) {
    case 'title':
      return property.title?.map((t) => t.plain_text).join('') || '';
    case 'rich_text':
      return property.rich_text?.map((t) => t.plain_text).join('') || '';
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select?.map((s) => s.name).join(', ') || '';
    case 'date':
      return property.date?.start || '';
    case 'checkbox':
      return property.checkbox ? 'true' : 'false';
    default:
      return '';
  }
}

/**
 * Notion 페이지 속성에서 태그 배열 추출
 */
function getTags(property: PageObjectResponse['properties'][string]): string[] {
  if (!property || property.type !== 'multi_select') return [];
  return property.multi_select?.map((tag) => tag.name) || [];
}

/**
 * Notion 페이지 속성에서 체크박스 값 추출
 */
function getCheckbox(property: PageObjectResponse['properties'][string]): boolean {
  if (!property || property.type !== 'checkbox') return false;
  return property.checkbox || false;
}

/**
 * Notion 페이지에서 커버 이미지 URL 추출 및 Cloudinary 업로드
 */
async function getCoverImage(
  page: PageObjectResponse
): Promise<string | undefined> {
  if (!page.cover) {
    return undefined;
  }

  let notionUrl: string | undefined;

  if (page.cover.type === 'external') {
    notionUrl = page.cover.external.url;
  } else if (page.cover.type === 'file') {
    notionUrl = page.cover.file.url;
  }

  if (!notionUrl) {
    return undefined;
  }

  // Cloudinary로 업로드
  try {
    const cloudinaryUrl = await uploadCoverImage(notionUrl, page.id);
    return cloudinaryUrl;
  } catch (error) {
    console.error('[Parser] Failed to upload cover image:', error);
    // Fallback to Notion URL
    return notionUrl;
  }
}

/**
 * Notion 페이지를 PostMeta로 변환
 */
export async function parsePageToPostMeta(
  page: PageObjectResponse | PartialPageObjectResponse
): Promise<PostMeta | null> {
  if (!('properties' in page)) return null;

  const properties = page.properties;
  const mapping = blogConfig.notion.propertyMapping;

  try {
    const title = getPlainText(properties[mapping.title]);
    const slug = getPlainText(properties[mapping.slug]);
    const status = getPlainText(properties[mapping.status]);

    // 필수 필드 검증
    if (!title || !slug) {
      console.warn(`Page ${page.id} is missing required fields (title or slug)`);
      return null;
    }

    const postMeta: PostMeta = {
      id: page.id,
      title,
      slug,
      status,
      excerpt: getPlainText(properties[mapping.excerpt]) || '',
      publishDate: getPlainText(properties[mapping.publishDate]) || new Date().toISOString(),
      tags: getTags(properties[mapping.tags]),
      category: getPlainText(properties[mapping.category]) || undefined,
      coverImage: await getCoverImage(page as PageObjectResponse),
      featured: getCheckbox(properties[mapping.featured]),
    };

    return postMeta;
  } catch (error) {
    console.error(`Error parsing page ${page.id}:`, error);
    return null;
  }
}

/**
 * Notion 페이지를 Post로 변환 (content 포함)
 */
export async function parsePageToPost(
  page: PageObjectResponse | PartialPageObjectResponse,
  content: string,
  headings: import('./types').Heading[] = [],
  references: import('./types').Reference[] = []
): Promise<Post | null> {
  const postMeta = await parsePageToPostMeta(page);

  if (!postMeta) return null;

  return {
    ...postMeta,
    content,
    headings,
    references,
  };
}

/**
 * 여러 페이지를 PostMeta 배열로 변환
 */
export async function parsePagesToPostMetas(
  pages: (PageObjectResponse | PartialPageObjectResponse)[]
): Promise<PostMeta[]> {
  const results = await Promise.all(pages.map(parsePageToPostMeta));
  return results.filter((post): post is PostMeta => post !== null);
}
