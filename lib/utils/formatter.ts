/**
 * 날짜, 텍스트 포맷팅 유틸리티
 */

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * ISO 날짜 문자열을 포맷팅
 */
export function formatDate(date: string | Date, formatStr = 'yyyy년 MM월 dd일'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ko });
}

/**
 * 상대적 시간 표시 (예: "3일 전")
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
}

/**
 * 텍스트 요약 (글자 수 제한)
 */
export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * 슬러그 생성 (한글 → 영문)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\-가-힣]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * 읽기 시간 계산 결과를 한글로 변환
 */
export function formatReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes}분`;
}
