/**
 * About 페이지
 * 블로그 작성자 소개 - minimal-portfolio 스타일
 */

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { blogConfig } from '@/blog.config';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('');
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const sections = ['intro', 'blog', 'connect'];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -20% 0px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const socialLinks: Array<{ name: string; url: string }> = [
    blogConfig.social.github && { name: 'GitHub', url: blogConfig.social.github },
    blogConfig.social.twitter && { name: 'Twitter', url: blogConfig.social.twitter },
    blogConfig.social.linkedin && { name: 'LinkedIn', url: blogConfig.social.linkedin },
  ].filter((link): link is { name: string; url: string } => Boolean(link));

  return (
    <div className="min-h-screen bg-background relative">
      {/* Fixed Navigation Dots */}
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`w-2 h-8 rounded-full transition-all duration-500 ${
                activeSection === section
                  ? 'bg-foreground'
                  : 'bg-foreground/40 hover:bg-foreground/70'
              }`}
              aria-label={`Navigate to ${section}`}
            />
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Intro Section */}
        <section
          id="intro"
          ref={(el) => { sectionsRef.current[0] = el; }}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="w-full space-y-8">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground font-mono tracking-wider">
                ABOUT
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                {blogConfig.author.name}
              </h1>
            </div>

            <div className="space-y-6 max-w-2xl">
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {blogConfig.blog.description}
              </p>

              {blogConfig.author.email && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">
                    Available for contact
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section
          id="blog"
          ref={(el) => { sectionsRef.current[1] = el; }}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="w-full space-y-12">
            <h2 className="text-3xl sm:text-4xl font-light">About This Blog</h2>

            <div className="space-y-8 max-w-2xl">
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  이 블로그는 Notion을 CMS로 사용하여 Next.js로 구축되었습니다.
                  글 작성은 Notion에서, 배포는 Vercel에서 자동으로 이루어집니다.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  누구나 이 블로그를 포크하여 환경변수만 설정하면 자신만의 블로그를
                  만들 수 있습니다.
                </p>
              </div>

              <div>
                <div className="text-sm text-muted-foreground font-mono mb-4">
                  TECH STACK
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Next.js 15', 'Notion API', 'TypeScript', 'Tailwind CSS', 'Vercel'].map(
                    (tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-sm border border-border rounded-full"
                      >
                        {tech}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors duration-300"
                >
                  <span>블로그 글 보기</span>
                  <svg
                    className="w-4 h-4"
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
            </div>
          </div>
        </section>

        {/* Connect Section */}
        <section
          id="connect"
          ref={(el) => { sectionsRef.current[2] = el; }}
          className="min-h-screen flex items-center opacity-0"
        >
          <div className="w-full space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl sm:text-4xl font-light">Let&apos;s Connect</h2>

              <div className="space-y-6 max-w-2xl">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  관심사나 협업 기회에 대해 이야기 나누고 싶으시다면 언제든 연락주세요.
                </p>

                {blogConfig.author.email && (
                  <Link
                    href={`mailto:${blogConfig.author.email}`}
                    className="group inline-flex items-center gap-3 text-foreground hover:text-muted-foreground transition-colors duration-300"
                  >
                    <span className="text-base sm:text-lg">
                      {blogConfig.author.email}
                    </span>
                    <svg
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
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
                )}
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="space-y-6">
                <div className="text-sm text-muted-foreground font-mono">
                  ELSEWHERE
                </div>

                <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-300 hover:shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="text-foreground group-hover:text-muted-foreground transition-colors duration-300">
                          {social.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {social.url.replace('https://', '').replace('mailto:', '')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
