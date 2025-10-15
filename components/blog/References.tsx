/**
 * 참고 자료 컴포넌트
 * 포스트의 참고 링크를 표시
 */

import type { Reference } from '@/lib/notion/types';

interface ReferencesProps {
  references: Reference[];
}

export function References({ references }: ReferencesProps) {
  if (references.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <ul className="space-y-2 text-sm">
        {references.map((ref, index) => (
          <li key={index}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-start gap-2 px-2 py-1.5 rounded
                text-muted-foreground hover:text-primary
                hover:bg-secondary/50 transition-colors
                group
              "
            >
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground/50 group-hover:text-primary/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              <span className="break-words">{ref.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
