/**
 * Markdown 처리 유틸리티
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Element } from 'hast';

/**
 * 이미지에 에러 핸들링 추가하는 rehype plugin
 * - 로딩 실패 시 placeholder 이미지로 대체
 * - 로컬 경로나 유효하지 않은 URL은 placeholder로 대체
 */
function rehypeImageErrorHandler() {
  return (tree: Element) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties) {
        const src = node.properties.src as string;

        // 유효한 HTTP/HTTPS URL이 아니면 placeholder로 대체
        if (!src || (!src.startsWith('http://') && !src.startsWith('https://'))) {
          node.properties.src = '/image-placeholder.png';
          node.properties.alt = node.properties.alt || 'Image not available';
          return;
        }

        // 에러 핸들러 추가 (onerror 속성)
        node.properties.onError = "this.onerror=null; this.src='/image-placeholder.png'; this.alt='Image failed to load';";

        // loading="lazy" 추가 (성능 최적화)
        node.properties.loading = 'lazy';
      }
    });
  };
}

/**
 * Markdown을 HTML로 변환
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse) // Markdown 파싱
    .use(remarkGfm) // GitHub Flavored Markdown 지원
    .use(remarkRehype) // Markdown AST를 HTML AST로 변환
    .use(rehypeSlug) // 헤딩에 ID 추가
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['anchor'],
      },
    }) // 헤딩에 링크 추가
    .use(rehypeImageErrorHandler) // 이미지 에러 핸들링
    .use(rehypeHighlight) // 코드 하이라이팅
    .use(rehypeStringify) // HTML 문자열로 변환
    .process(markdown);

  return String(result);
}
