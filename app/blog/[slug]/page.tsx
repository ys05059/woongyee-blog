/**
 * 블로그 포스트 상세 페이지
 */

import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/notion";
import { formatDate, generateArticleJsonLd } from "@/lib/utils";
import { Comments } from "@/components/blog/Comments";
import { RightSidebar } from "@/components/blog/RightSidebar";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// 정적 페이지 생성을 위한 slug 목록 반환
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 메타데이터 생성
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const ogImage =
    post.coverImage ||
    `/api/og?title=${encodeURIComponent(
      post.title
    )}&description=${encodeURIComponent(post.excerpt)}`;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishDate,
      tags: post.tags,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = generateArticleJsonLd(post);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-12 max-w-[1400px]">
        <div className="flex gap-8">
          {/* 메인 컨텐츠 */}
          <article className="flex-1 min-w-0 px-4 md:px-8">
            {/* 헤더 */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {post.title}
              </h1>

              {/* 메타 정보 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <time dateTime={post.publishDate}>
                  {formatDate(post.publishDate, "yyyy년 MM월 dd일")}
                </time>
                {post.readingTime && <span>{post.readingTime}</span>}
                {post.category && <span>· {post.category}</span>}
              </div>

              {/* 태그 */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* 본문 */}
            <div className="article-content mb-16 w-full">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* 댓글 */}
            <div id="comments" className="border-t pt-8">
              <Comments />
            </div>
          </article>

          {/* 오른쪽 사이드바 */}
          <RightSidebar headings={post.headings} references={post.references} />
        </div>
      </div>
    </>
  );
}
