/**
 * 카테고리별 포스트 목록 페이지
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByCategory, getAllCategories } from '@/lib/notion';
import { PostCard } from '@/components/blog/PostCard';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// 정적 페이지 생성
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  return {
    title: decodedCategory,
    description: `${decodedCategory} 카테고리의 포스트 목록`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  const posts = await getPostsByCategory(decodedCategory);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 sm:px-8 py-20 sm:py-32">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                className="w-4 h-4"
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
              블로그
            </Link>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">
                CATEGORY
              </div>
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight">
                {decodedCategory}
              </h1>
              <p className="text-lg text-muted-foreground">
                {posts.length}개의 포스트
              </p>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
