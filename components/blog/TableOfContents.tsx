/**
 * 목차 (Table of Contents) 컴포넌트
 * 포스트의 heading(h1-h3)을 표시하고 클릭 시 해당 섹션으로 스크롤
 * 동적 접기/펼치기: 현재 활성 h2의 하위 h3만 표시
 */

'use client';

import { useState, useEffect } from 'react';
import { useActiveHeading } from '@/hooks/useActiveHeading';
import type { Heading } from '@/lib/notion/types';

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  // 댓글 항목 추가
  const allHeadings: Heading[] = [
    ...headings,
    { id: 'comments', level: 2, text: '댓글' }
  ];

  const headingIds = allHeadings.map((h) => h.id);
  const { activeId, setActiveId } = useActiveHeading(headingIds);

  // 확장된 h2 목록 관리
  const [expandedH2Ids, setExpandedH2Ids] = useState<string[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string, level: number) => {
    e.preventDefault();

    const heading = allHeadings.find(h => h.id === id);

    // h2 클릭 시 토글 처리
    if (level === 2 && heading) {
      if (activeId === id && expandedH2Ids.includes(id)) {
        // 이미 활성화되고 열려있으면 → 닫기
        setExpandedH2Ids(prev => prev.filter(h2Id => h2Id !== id));
        return;
      } else {
        // 닫혀있거나 비활성화 상태 → 열기
        if (!expandedH2Ids.includes(id)) {
          setExpandedH2Ids(prev => [...prev, id]);
        }
      }
    }

    // 스크롤 이동
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

  // 현재 활성화된 heading의 부모 h2 찾기
  const activeHeading = allHeadings.find((h) => h.id === activeId);
  let activeParentH2Id: string | null = null;

  if (activeHeading) {
    if (activeHeading.level === 1 || activeHeading.level === 2) {
      activeParentH2Id = activeHeading.id;
    } else if (activeHeading.level === 3) {
      // h3의 경우 이전 h2 찾기
      const activeIndex = allHeadings.findIndex((h) => h.id === activeId);
      for (let i = activeIndex - 1; i >= 0; i--) {
        if (allHeadings[i].level === 2) {
          activeParentH2Id = allHeadings[i].id;
          break;
        }
      }
    }
  }

  // 스크롤로 activeId 변경 시 자동으로 해당 h2 확장
  useEffect(() => {
    if (activeParentH2Id && !expandedH2Ids.includes(activeParentH2Id)) {
      setExpandedH2Ids(prev => [...prev, activeParentH2Id]);
    }
  }, [activeParentH2Id, expandedH2Ids]);

  // Early return은 모든 hooks 이후에
  if (headings.length === 0) {
    return null;
  }

  // 표시할 heading 필터링
  const visibleHeadings: Heading[] = [];
  let currentH2: Heading | null = null;

  for (const heading of allHeadings) {
    if (heading.level === 1 || heading.level === 2) {
      visibleHeadings.push(heading);
      currentH2 = heading;
    } else if (heading.level === 3) {
      // h3는 부모 h2가 활성화되고 확장되어 있을 때만 표시
      if (currentH2 && currentH2.id === activeParentH2Id && expandedH2Ids.includes(currentH2.id)) {
        visibleHeadings.push(heading);
      }
    }
  }

  return (
    <nav className="space-y-1">
      <div className="text-base font-semibold text-foreground mb-3">목차</div>
      <ul className="space-y-1 text-sm">
        {visibleHeadings.map((heading) => {
          const isActive = activeId === heading.id;
          const indent = (heading.level - 1) * 12; // level 1: 0px, level 2: 12px, level 3: 24px

          return (
            <li key={heading.id} style={{ paddingLeft: `${indent}px` }}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id, heading.level)}
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
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
