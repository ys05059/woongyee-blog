/**
 * HTML에서 heading 추출 (rehype plugin)
 */

import { visit } from 'unist-util-visit';
import type { Element, Root, Text } from 'hast';
import type { Plugin } from 'unified';
import type { Heading } from '@/lib/notion/types';

/**
 * Element 노드에서 텍스트 추출 (재귀적, 깊이 제한)
 */
function extractText(node: Element, depth = 0, maxDepth = 500): string {
  if (depth > maxDepth) return '';

  let text = '';

  for (const child of node.children) {
    if (child.type === 'text') {
      text += (child as Text).value;
    } else if (child.type === 'element') {
      text += extractText(child as Element, depth + 1, maxDepth);
    }
  }

  return text;
}

/**
 * HTML에서 h1, h2, h3 추출하는 rehype plugin
 *
 * rehype-slug가 이미 id를 생성했으므로 그것을 사용
 */
export function rehypeExtractHeadings(headings: Heading[]): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      visit(tree, 'element', (node) => {
        const element = node as Element;
        if (['h1', 'h2', 'h3'].includes(element.tagName)) {
          const level = parseInt(element.tagName[1]) as 1 | 2 | 3;
          const id = element.properties?.id as string;
          const text = extractText(element);

          if (id && text) {
            headings.push({
              id,
              level,
              text: text.trim(),
            });
          }
        }
      });
    };
  };
}
