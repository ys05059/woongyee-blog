/**
 * PostCard 컴포넌트
 * 블로그 포스트 카드 (목록에서 사용)
 */

import Link from 'next/link';
import { PostMeta } from '@/lib/notion/types';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
  post: PostMeta;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="block p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg"
      >
        <div className="space-y-4">
          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <time dateTime={post.publishDate}>
              {formatDate(post.publishDate, 'MMM dd, yyyy').toUpperCase()}
            </time>
            {post.readingTime && <span>{post.readingTime}</span>}
          </div>

          {/* 제목 */}
          <h2 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
            {post.title}
          </h2>

          {/* 요약 */}
          {post.excerpt && (
            <p className="text-muted-foreground leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* 태그 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs text-muted-foreground border border-border rounded-md"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Read more indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 pt-2">
            <span>Read more</span>
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
          </div>
        </div>
      </Link>
    </article>
  );
}
