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
    .use(rehypeHighlight) // 코드 하이라이팅
    .use(rehypeStringify) // HTML 문자열로 변환
    .process(markdown);

  return String(result);
}
