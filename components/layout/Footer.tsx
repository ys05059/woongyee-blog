/**
 * Footer 컴포넌트
 * 블로그 하단 정보
 */

import Link from 'next/link';
import { blogConfig } from '@/blog.config';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks: Array<{ name: string; url: string }> = [
    blogConfig.social.github && { name: 'GitHub', url: blogConfig.social.github },
    blogConfig.social.twitter && { name: 'Twitter', url: blogConfig.social.twitter },
    blogConfig.social.linkedin && { name: 'LinkedIn', url: blogConfig.social.linkedin },
    blogConfig.author.email && { name: 'Email', url: `mailto:${blogConfig.author.email}` },
  ].filter((link): link is { name: string; url: string } => Boolean(link));

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Left: Blog info */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              © {currentYear} {blogConfig.author.name}. All rights reserved.
            </div>
            <div className="text-xs text-muted-foreground">
              Built with{' '}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Next.js
              </a>
              {' & '}
              <a
                href="https://notion.so"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Notion
              </a>
            </div>
          </div>

          {/* Right: Navigation & Social */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            {/* Navigation */}
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground font-mono tracking-wider">
                NAVIGATE
              </div>
              <nav className="flex flex-col gap-2">
                {blogConfig.navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/tags"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tags
                </Link>
              </nav>
            </div>

            {/* Social */}
            {socialLinks.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground font-mono tracking-wider">
                  CONNECT
                </div>
                <nav className="flex flex-col gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target={link.name !== 'Email' ? '_blank' : undefined}
                      rel={link.name !== 'Email' ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
