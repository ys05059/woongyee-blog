/**
 * Footer 컴포넌트
 * 블로그 하단 정보
 */

import Link from 'next/link';
import { blogConfig } from '@/blog.config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 블로그 정보 */}
          <div>
            <h3 className="font-bold text-lg mb-2">{blogConfig.blog.name}</h3>
            <p className="text-sm text-muted-foreground">
              {blogConfig.blog.description}
            </p>
          </div>

          {/* 링크 */}
          <div>
            <h3 className="font-bold text-lg mb-2">Links</h3>
            <ul className="space-y-2 text-sm">
              {blogConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h3 className="font-bold text-lg mb-2">Connect</h3>
            <ul className="space-y-2 text-sm">
              {blogConfig.social.github && (
                <li>
                  <a
                    href={blogConfig.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              )}
              {blogConfig.social.twitter && (
                <li>
                  <a
                    href={blogConfig.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                </li>
              )}
              {blogConfig.social.linkedin && (
                <li>
                  <a
                    href={blogConfig.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
              {blogConfig.author.email && (
                <li>
                  <a
                    href={`mailto:${blogConfig.author.email}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Email
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {blogConfig.author.name}. All rights reserved.
          </p>
          <p className="mt-2">
            Powered by{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Next.js
            </a>
            {' & '}
            <a
              href="https://notion.so"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Notion
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
