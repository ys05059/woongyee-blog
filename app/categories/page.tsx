/**
 * 카테고리 목록 페이지
 * 모든 카테고리와 각 카테고리의 포스트 수 표시
 */

import Link from 'next/link';
import { getAllCategories, getPublishedPosts } from '@/lib/notion';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: '블로그 카테고리 목록',
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const allPosts = await getPublishedPosts();

  // 각 카테고리의 포스트 수 계산
  const categoryCounts = categories.map((category) => ({
    name: category,
    count: allPosts.filter((post) => post.category === category).length,
  }));

  // 포스트 수 내림차순 정렬
  categoryCounts.sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-20 sm:py-32">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">
              CATEGORIES
            </div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight">
              Browse by Categories
            </h1>
            <p className="text-lg text-muted-foreground">
              총 {categories.length}개의 카테고리
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">아직 카테고리가 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryCounts.map((category) => (
                <Link
                  key={category.name}
                  href={`/categories/${encodeURIComponent(category.name)}`}
                  className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
                        {category.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {category.count}개의 포스트
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground transform group-hover:translate-x-1 transition-transform duration-300"
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
