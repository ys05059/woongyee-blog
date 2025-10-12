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
    <article className="group relative flex flex-col space-y-2">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* 제목 */}
        <h2 className="text-2xl font-bold tracking-tight group-hover:underline">
          {post.title}
        </h2>

        {/* 요약 */}
        {post.excerpt && (
          <p className="text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <time dateTime={post.publishDate}>
            {formatDate(post.publishDate, 'yyyy. MM. dd')}
          </time>
          {post.readingTime && <span>{post.readingTime}</span>}
        </div>

        {/* 태그 */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
