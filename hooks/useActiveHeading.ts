/**
 * 현재 화면에 보이는 heading을 추적하는 hook
 * Intersection Observer와 스크롤 이벤트를 사용하여 active heading 감지
 */

'use client';

import { useEffect, useState, useRef } from 'react';

export function useActiveHeading(headingIds: string[]) {
  const [activeId, setActiveId] = useState<string>('');
  const ignoreObserverRef = useRef(false);

  useEffect(() => {
    if (headingIds.length === 0) return;

    // 스크롤 이벤트로 댓글 섹션 감지
    const handleScroll = () => {
      if (ignoreObserverRef.current) return;

      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200;

      if (scrolledToBottom && headingIds.length > 0) {
        setActiveId(headingIds[headingIds.length - 1]); // 댓글 활성화
        return;
      }

      // 일반적인 경우: 헤더 바로 아래 지점을 기준으로 가장 가까운 heading 찾기
      const headerOffset = 140; // 헤더(64px) + 여유(76px)
      let closestHeading = '';
      let closestDistance = Infinity;

      headingIds.forEach((id) => {
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

      // 모든 heading이 헤더 아래에 있지 않으면, 가장 가까운 아래쪽 heading
      if (!closestHeading) {
        closestDistance = Infinity;
        headingIds.forEach((id) => {
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
    };

    // 초기 실행
    handleScroll();

    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headingIds]);

  // 클릭 시 즉시 반영하고 잠시 자동 감지 중지
  const setActiveIdWithDelay = (id: string) => {
    ignoreObserverRef.current = true;
    setActiveId(id);

    setTimeout(() => {
      ignoreObserverRef.current = false;
    }, 1000); // 1초 후 자동 감지 재개
  };

  return { activeId, setActiveId: setActiveIdWithDelay };
}
