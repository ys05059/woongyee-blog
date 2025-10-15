/**
 * HTML에서 참고 자료 추출 및 제거 (rehype plugin)
 */

import type { Element, Root, Text, Parent } from 'hast';
import type { Plugin } from 'unified';
import type { Reference } from '@/lib/notion/types';

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
 * "참고" 섹션인지 확인
 */
function isReferenceHeading(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return (
    normalized === '참고' ||
    normalized === '참고 자료' ||
    normalized === 'references' ||
    normalized === 'reference'
  );
}

/**
 * Element에서 링크 추출 (재귀적, 깊이 제한)
 */
function extractLinks(node: Element, references: Reference[], depth = 0, maxDepth = 500): void {
  if (depth > maxDepth) return;

  if (node.tagName === 'a' && node.properties?.href) {
    const href = node.properties.href as string;
    const text = extractText(node);

    if (href && text) {
      references.push({
        url: href,
        title: text.trim(),
      });
    }
  }

  // 자식 노드 탐색
  for (const child of node.children) {
    if (child.type === 'element') {
      extractLinks(child as Element, references, depth + 1, maxDepth);
    }
  }
}

/**
 * HTML에서 "참고" 섹션 추출하고 제거하는 rehype plugin
 *
 * 1. h2/h3 중 "참고" 텍스트를 가진 heading 찾기
 * 2. 해당 heading부터 다음 heading 전까지의 모든 링크 수집
 * 3. 해당 섹션 전체를 DOM에서 제거
 */
export function rehypeExtractReferences(references: Reference[]): Plugin<[], Root> {
  return () => {
    return (tree: Root) => {
      if (!tree || !tree.children) return;

      const parent = tree as Parent;
      const nodesToRemove: number[] = [];
      let inReferenceSection = false;

      // 1단계: "참고" 섹션 찾기 및 링크 수집
      for (let i = 0; i < parent.children.length; i++) {
        const node = parent.children[i];

        if (node.type !== 'element') continue;

        const element = node as Element;

        // heading 발견
        if (['h1', 'h2', 'h3'].includes(element.tagName)) {
          const text = extractText(element);

          // 이전 참고 섹션 종료
          if (inReferenceSection) {
            inReferenceSection = false;
          }

          // 새로운 참고 섹션 시작
          if (isReferenceHeading(text)) {
            inReferenceSection = true;
            nodesToRemove.push(i); // heading 제거
            continue;
          }
        }

        // 참고 섹션 내부의 노드 처리
        if (inReferenceSection) {
          // 링크 수집
          extractLinks(element, references);
          // 제거 대상에 추가
          nodesToRemove.push(i);
        }
      }

      // 2단계: 노드 제거 (뒤에서부터 제거해야 인덱스 안 꼬임)
      for (let i = nodesToRemove.length - 1; i >= 0; i--) {
        parent.children.splice(nodesToRemove[i], 1);
      }
    };
  };
}
