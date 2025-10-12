/**
 * 홈페이지
 * 최신 블로그 포스트 목록 표시
 */

import Link from 'next/link';
import { getPublishedPosts } from '@/lib/notion';
import { PostCard } from '@/components/blog/PostCard';
import { blogConfig } from '@/blog.config';
import { generateWebSiteJsonLd } from '@/lib/utils';

export default async function HomePage() {
  // unstable_cache로 캐싱됨 (blog.config.ts의 revalidate.postList 값 사용)
  const posts = await getPublishedPosts({ limit: 6 });
  const jsonLd = generateWebSiteJsonLd();

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          {blogConfig.blog.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {blogConfig.blog.description}
        </p>
      </section>

      {/* Latest Posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">최신 포스트</h2>
          <Link
            href="/blog"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            모두 보기 →
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              아직 발행된 포스트가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Notion 데이터베이스에서 Status를 &quot;Published&quot;로 설정해주세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
      </div>
    </>
  );
}
