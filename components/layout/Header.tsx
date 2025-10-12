/**
 * Header 컴포넌트
 * 블로그 상단 네비게이션
 */

import Link from 'next/link';
import { blogConfig } from '@/blog.config';
import { SearchBar } from '@/components/common';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        {/* 로고 / 블로그 이름 */}
        <Link
          href="/"
          className="flex items-center space-x-2 text-xl font-bold hover:opacity-80 transition-opacity"
        >
          <span>{blogConfig.blog.name}</span>
        </Link>

        {/* 네비게이션 & 검색 */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {blogConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
