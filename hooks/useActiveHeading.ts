/**
 * 현재 화면에 보이는 heading을 추적하는 hook
 * 스크롤 이벤트를 사용하여 active heading 감지
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export function useActiveHeading(headingIds: string[]) {
  const [activeId, setActiveId] = useState<string>('');
  const ignoreObserverRef = useRef(false);
  const headingIdsRef = useRef<string[]>([]);

  // headingIds를 ref에 저장하여 의존성 문제 해결
  useEffect(() => {
    headingIdsRef.current = headingIds;
  }, [headingIds]);

  const handleScroll = useCallback(() => {
    if (ignoreObserverRef.current) return;

    const currentHeadingIds = headingIdsRef.current;
    if (currentHeadingIds.length === 0) return;

    // 스크롤이 거의 끝에 도달하면 마지막 항목(댓글) 활성화
    const scrolledToBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;

    if (scrolledToBottom) {
      setActiveId(currentHeadingIds[currentHeadingIds.length - 1]);
      return;
    }

    // 헤더 높이 동적 계산
    const header = document.querySelector('header[class*="sticky"], header[class*="fixed"], nav[class*="sticky"], nav[class*="fixed"]');
    const headerHeight = header?.getBoundingClientRect().height || 64;
    const headerOffset = headerHeight + 76; // 헤더 높이 + 여유

    let closestHeading = '';
    let closestDistance = Infinity;

    // 헤더 아래에 있는 heading 중 가장 가까운 것 찾기
    currentHeadingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top - headerOffset);

        // 헤더 아래에 있고, 가장 가까운 요소
        if (rect.top <= headerOffset && distance < closestDistance) {
          closestDistance = distance;
          closestHeading = id;
        }
      }
    });

    // 모든 heading이 헤더 아래에 없으면, 가장 가까운 아래쪽 heading
    if (!closestHeading) {
      closestDistance = Infinity;
      currentHeadingIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top > headerOffset && rect.top < closestDistance) {
            closestDistance = rect.top;
            closestHeading = id;
          }
        }
      });
    }

    if (closestHeading) {
      setActiveId(closestHeading);
    }
  }, []);

  useEffect(() => {
    if (headingIdsRef.current.length === 0) return;

    // 초기 실행
    handleScroll();

    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // 클릭 시 즉시 반영하고 잠시 자동 감지 중지
  const setActiveIdWithDelay = useCallback((id: string) => {
    ignoreObserverRef.current = true;
    setActiveId(id);

    setTimeout(() => {
      ignoreObserverRef.current = false;
    }, 1000); // 1초 후 자동 감지 재개
  }, []);

  return { activeId, setActiveId: setActiveIdWithDelay };
}
