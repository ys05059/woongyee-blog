/**
 * 블로그 목록 페이지
 * 모든 발행된 포스트 표시
 */

import { getPublishedPosts } from '@/lib/notion';
import { PostCard } from '@/components/blog/PostCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: '모든 블로그 포스트',
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-muted-foreground">
          총 {posts.length}개의 포스트
        </p>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            아직 발행된 포스트가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
