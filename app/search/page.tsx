/**
 * 검색 결과 페이지
 */

import { searchPosts } from '@/lib/notion';
import { PostCard } from '@/components/blog/PostCard';
import type { Metadata } from 'next';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `"${q}" 검색 결과` : '검색',
    description: '블로그 포스트 검색',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';

  // 검색어가 없으면 빈 결과
  const posts = query.trim() ? await searchPosts(query) : [];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">검색 결과</h1>
        {query && (
          <p className="text-muted-foreground">
            &quot;{query}&quot; 검색 결과: {posts.length}개의 포스트
          </p>
        )}
      </div>

      {/* Results */}
      {!query.trim() ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">검색어를 입력해주세요.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            검색 결과가 없습니다. 다른 키워드로 시도해보세요.
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
