/**
 * 목차 (Table of Contents) 컴포넌트
 * 포스트의 heading(h1-h3)을 표시하고 클릭 시 해당 섹션으로 스크롤
 * 3레이어 계층 구조: h1 > h2 > h3 유연하게 대응
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useActiveHeading } from '@/hooks/useActiveHeading';
import type { Heading } from '@/lib/notion/types';

interface TableOfContentsProps {
  headings: Heading[];
}

// 계층 구조 정보
interface HeadingNode extends Heading {
  parentId: string | null; // 부모 heading의 id
  hasChildren: boolean; // 자식 heading이 있는지
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  // 댓글 항목 추가
  const allHeadings: Heading[] = useMemo(() => [
    ...headings,
    { id: 'comments', level: 2, text: '댓글' }
  ], [headings]);

  const headingIds = useMemo(() => allHeadings.map((h) => h.id), [allHeadings]);
  const { activeId, setActiveId } = useActiveHeading(headingIds);

  // 확장된 heading id 목록 관리
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // 계층 구조 파악: 각 heading의 부모 찾기
  const headingNodes = useMemo(() => {
    const nodes: HeadingNode[] = [];

    for (let i = 0; i < allHeadings.length; i++) {
      const current = allHeadings[i];
      let parentId: string | null = null;

      // 이전 heading들 중에서 부모 찾기
      for (let j = i - 1; j >= 0; j--) {
        const prev = allHeadings[j];
        // 현재보다 레벨이 낮은(상위) heading을 찾으면 그게 부모
        if (prev.level < current.level) {
          parentId = prev.id;
          break;
        }
      }

      // 자식이 있는지 확인
      const hasChildren = allHeadings.some((h, idx) => {
        if (idx <= i) return false;
        // 다음 heading이 현재보다 레벨이 높으면(하위) 자식
        if (h.level > current.level) return true;
        // 같거나 낮은 레벨이 나오면 자식 영역 끝
        return false;
      });

      nodes.push({
        ...current,
        parentId,
        hasChildren,
      });
    }

    return nodes;
  }, [allHeadings]);

  // 특정 heading의 모든 조상(ancestors) id 배열 반환
  const getAncestorIds = useMemo(() => {
    return (headingId: string): string[] => {
      const ancestors: string[] = [];
      let currentNode = headingNodes.find(n => n.id === headingId);

      while (currentNode?.parentId) {
        ancestors.push(currentNode.parentId);
        currentNode = headingNodes.find(n => n.id === currentNode!.parentId);
      }

      return ancestors;
    };
  }, [headingNodes]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    const node = headingNodes.find(n => n.id === id);
    if (!node) return;

    // 자식이 있는 heading(h1, h2)을 클릭한 경우
    if (node.hasChildren) {
      const isCurrentlyExpanded = expandedIds.has(id);

      // 열려있으면 → 닫기만 하고 리턴 (스크롤 이동 없음)
      if (isCurrentlyExpanded) {
        setExpandedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        return;
      } else {
        // 닫혀있으면 → 열기
        setExpandedIds(prev => new Set(prev).add(id));
      }
    }

    // 스크롤 이동 (자식이 없거나, 닫혀있던 헤더를 연 경우만 실행)
    setActiveId(id);

    const element = document.getElementById(id);
    if (element) {
      // Header 높이 동적 계산
      const header = document.querySelector('header[class*="sticky"], header[class*="fixed"], nav[class*="sticky"], nav[class*="fixed"]');
      const headerHeight = header?.getBoundingClientRect().height || 64;
      const yOffset = -(headerHeight + 20); // 20px 여유
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'instant' });
      // URL 업데이트
      window.history.pushState(null, '', `#${id}`);
    }
  };

  // 스크롤로 activeId 변경 시 해당 heading의 조상만 열고 나머지는 닫기
  useEffect(() => {
    if (activeId) {
      const ancestorIds = getAncestorIds(activeId);
      setExpandedIds(new Set(ancestorIds));
    }
  }, [activeId, getAncestorIds]);

  // 표시할 heading 필터링: 부모가 없거나 모든 조상이 확장되어 있으면 표시
  const visibleHeadings = useMemo(() => {
    return headingNodes.filter(node => {
      // 부모가 없으면 최상위이므로 항상 표시
      if (!node.parentId) return true;

      // 모든 조상이 확장되어 있어야 표시
      const ancestors = getAncestorIds(node.id);
      return ancestors.every(ancestorId => expandedIds.has(ancestorId));
    });
  }, [headingNodes, expandedIds, getAncestorIds]);

  // Early return: headings가 없으면 렌더링하지 않음
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-1">
      <ul className="space-y-1 text-sm">
        {visibleHeadings.map((node) => {
          const isActive = activeId === node.id;
          const indent = (node.level - 1) * 12;

          return (
            <li key={node.id} style={{ paddingLeft: `${indent}px` }}>
              <a
                href={`#${node.id}`}
                onClick={(e) => handleClick(e, node.id)}
                className={`
                  block py-1.5 px-2 rounded transition-all duration-200
                  hover:text-primary hover:bg-secondary/50
                  ${
                    isActive
                      ? 'text-primary font-medium bg-secondary'
                      : 'text-muted-foreground'
                  }
                `}
              >
                {node.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
