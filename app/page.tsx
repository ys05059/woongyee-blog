/**
 * 홈페이지
 * 최신 블로그 포스트 목록 표시
 */

import Link from 'next/link';
import { getPublishedPosts, getAllCategories, getAllTags } from '@/lib/notion';
import { PostCard } from '@/components/blog/PostCard';
import { blogConfig } from '@/blog.config';
import { generateWebSiteJsonLd } from '@/lib/utils';

export default async function HomePage() {
  // unstable_cache로 캐싱됨 (blog.config.ts의 revalidate.postList 값 사용)
  const posts = await getPublishedPosts({ limit: blogConfig.homepage.recentPostsCount });
  const allPosts = await getPublishedPosts();
  const categories = await getAllCategories();
  const tags = await getAllTags();

  // 카테고리별 포스트 수
  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: allPosts.filter((p) => p.category === cat).length,
  })).sort((a, b) => b.count - a.count).slice(0, blogConfig.homepage.categoriesCount);

  // 태그별 포스트 수 (인기 순)
  const tagCounts = tags.map((tag) => ({
    name: tag,
    count: allPosts.filter((p) => p.tags.includes(tag)).length,
  })).sort((a, b) => b.count - a.count).slice(0, blogConfig.homepage.tagsCount);

  const jsonLd = generateWebSiteJsonLd();

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-6 sm:px-8 py-20 sm:py-32">
      {/* Hero Section */}
      <section className="mb-20 sm:mb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4 text-center">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">
              WELCOME
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
              {blogConfig.blog.name}
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
            {blogConfig.blog.description}
          </p>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="mb-20 sm:mb-32">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-mono tracking-wider">
              RECENT POSTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-light">Recent Posts</h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>View all</span>
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

      {/* Categories Section */}
      {categoryCounts.length > 0 && (
        <section className="mb-20 sm:mb-32">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">
                CATEGORIES
              </div>
              <h2 className="text-3xl sm:text-4xl font-light">Browse by Category</h2>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span>View all</span>
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryCounts.map((category) => (
              <Link
                key={category.name}
                href={`/categories/${encodeURIComponent(category.name)}`}
                className="group p-6 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium group-hover:text-muted-foreground transition-colors duration-300">
                      {category.name}
                    </h3>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tags Section */}
      {tagCounts.length > 0 && (
        <section className="mb-20 sm:mb-32">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">
                TAGS
              </div>
              <h2 className="text-3xl sm:text-4xl font-light">Popular Tags</h2>
            </div>
            <Link
              href="/tags"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span>View all</span>
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

          <div className="flex flex-wrap gap-3">
            {tagCounts.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
                className="group inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
              >
                <span className="text-sm group-hover:text-muted-foreground transition-colors duration-300">
                  #{tag.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
