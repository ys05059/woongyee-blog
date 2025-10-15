/**
 * 오른쪽 사이드바 컴포넌트
 * 목차와 참고 자료를 포함하는 sticky 사이드바
 * xl 이하에서는 핸들 버튼으로 토글 가능한 플로팅 사이드바
 */

'use client';

import { useState } from 'react';
import { TableOfContents } from './TableOfContents';
import { References } from './References';
import type { Heading, Reference } from '@/lib/notion/types';

interface RightSidebarProps {
  headings: Heading[];
  references: Reference[];
}

export function RightSidebar({ headings, references }: RightSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 목차와 참고 자료가 모두 없으면 렌더링하지 않음
  if (headings.length === 0 && references.length === 0) {
    return null;
  }

  return (
    <>
      {/* xl 이상: 기존 방식 */}
      <aside className="hidden xl:block w-72 flex-shrink-0">
        <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col">
          {headings.length > 0 && (
            <>
              <div className="text-base font-semibold text-foreground mb-3 flex-shrink-0">목차</div>
              <div className="flex-[7] min-h-0 overflow-y-auto scrollbar-hide">
                <div className="pb-2">
                  <TableOfContents headings={headings} />
                </div>
              </div>
            </>
          )}
          {headings.length > 0 && references.length > 0 && (
            <div className="border-t border-border my-2 flex-shrink-0" />
          )}
          {references.length > 0 && (
            <>
              <div className="text-base font-semibold text-foreground mb-3 flex-shrink-0">참고 자료</div>
              <div className="flex-[3] min-h-0 overflow-y-auto scrollbar-hide">
                <div className="pt-2">
                  <References references={references} />
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* xl 이하: 플로팅 사이드바 + 핸들 */}
      <div className="xl:hidden">
        {/* 플로팅 사이드바 컨테이너 (핸들 포함) */}
        <div
          className={`
            fixed top-[15vh] right-0 z-30
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="relative flex items-stretch">
            {/* 핸들 버튼 */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                         bg-background border border-r-0 border-border
                         px-1.5 py-8 rounded-l-lg shadow-lg
                         hover:bg-secondary transition-colors
                         flex items-center justify-center"
              aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'}
            >
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}
                />
              </svg>
            </button>

            {/* 사이드바 본체 */}
            <aside className="w-72 h-[70vh] bg-background border border-border rounded-l-xl shadow-2xl overflow-hidden flex flex-col">
              {headings.length > 0 && (
                <>
                  <div className="text-base font-semibold text-foreground px-6 pt-6 pb-3 flex-shrink-0">목차</div>
                  <div className="flex-[7] min-h-0 overflow-y-auto scrollbar-hide px-6">
                    <TableOfContents headings={headings} />
                  </div>
                </>
              )}
              {headings.length > 0 && references.length > 0 && (
                <div className="border-t border-border mx-6 my-2 flex-shrink-0" />
              )}
              {references.length > 0 && (
                <>
                  <div className="text-base font-semibold text-foreground px-6 pb-3 flex-shrink-0">참고 자료</div>
                  <div className="flex-[3] min-h-0 overflow-y-auto scrollbar-hide px-6 pb-6">
                    <References references={references} />
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
