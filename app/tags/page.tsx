/**
 * 태그 목록 페이지
 * 모든 태그와 각 태그의 포스트 수 표시
 */

import Link from 'next/link';
import { getAllTags, getPublishedPosts } from '@/lib/notion';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tags',
  description: '블로그 태그 목록',
};

export default async function TagsPage() {
  const tags = await getAllTags();
  const allPosts = await getPublishedPosts();

  // 각 태그의 포스트 수 계산
  const tagCounts = tags.map((tag) => ({
    name: tag,
    count: allPosts.filter((post) => post.tags.includes(tag)).length,
  }));

  // 포스트 수 내림차순 정렬
  tagCounts.sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-6 sm:px-8 py-20 sm:py-32">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">
              TAGS
            </div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight">
              Browse by Tags
            </h1>
            <p className="text-lg text-muted-foreground">
              총 {tags.length}개의 태그
            </p>
          </div>

          {/* Tags Grid */}
          {tags.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">아직 태그가 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tagCounts.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-lg font-medium group-hover:text-muted-foreground transition-colors duration-300">
                        #{tag.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {tag.count}개의 포스트
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
