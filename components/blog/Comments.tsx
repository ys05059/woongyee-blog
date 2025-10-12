/**
 * Giscus 댓글 컴포넌트
 */

'use client';

import { useEffect, useRef } from 'react';
import { blogConfig } from '@/blog.config';

export function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Giscus가 설정되지 않았으면 아무것도 하지 않음
    if (!blogConfig.features.comments || !blogConfig.giscus.repo) {
      return;
    }

    if (!ref.current || ref.current.hasChildNodes()) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', blogConfig.giscus.repo);
    script.setAttribute('data-repo-id', blogConfig.giscus.repoId);
    script.setAttribute('data-category', blogConfig.giscus.category);
    script.setAttribute('data-category-id', blogConfig.giscus.categoryId);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    ref.current.appendChild(script);
  }, []);

  // Giscus가 설정되지 않았으면 렌더링하지 않음
  if (!blogConfig.features.comments || !blogConfig.giscus.repo) {
    return null;
  }

  return <div ref={ref} className="giscus" />;
}
