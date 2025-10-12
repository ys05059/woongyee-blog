/**
 * className 유틸리티
 * clsx + tailwind-merge를 결합하여 Tailwind 클래스 충돌 방지
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * className을 조건부로 합치고 Tailwind 충돌 해결
 * @example
 * cn('px-2 py-1', condition && 'bg-blue-500', 'px-4')
 * // → 'py-1 bg-blue-500 px-4' (px-2가 px-4로 오버라이드)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
