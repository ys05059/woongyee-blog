/**
 * 태그별 포스트 목록 페이지
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByTag, getAllTags } from '@/lib/notion';
import { PostCard } from '@/components/blog/PostCard';
import type { Metadata } from 'next';

interface TagPageProps {
  params: Promise<{
    tag: string;
  }>;
}

// 정적 페이지 생성
export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((tag) => ({
    tag: encodeURIComponent(tag),
  }));
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `#${decodedTag}`,
    description: `${decodedTag} 태그가 있는 포스트 목록`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  const posts = await getPostsByTag(decodedTag);

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
              href="/tags"
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
              모든 태그
            </Link>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-light tracking-tight">
                #{decodedTag}
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
