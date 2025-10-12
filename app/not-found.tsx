/**
 * 404 Not Found 페이지
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
        {/* 404 숫자 */}
        <div className="space-y-4">
          <h1 className="text-8xl sm:text-9xl font-light text-muted-foreground tracking-tight">
            404
          </h1>
          <div className="text-sm text-muted-foreground font-mono tracking-wider">
            PAGE NOT FOUND
          </div>
        </div>

        {/* 설명 */}
        <div className="space-y-4">
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            찾으시는 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        {/* 링크 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
          >
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>홈으로 돌아가기</span>
          </Link>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 px-6 py-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
          >
            <span>블로그 보기</span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
