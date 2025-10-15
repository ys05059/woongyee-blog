/**
 * Blog Configuration Example
 *
 * 이 파일을 복사하여 blog.config.ts로 저장하고 사용하세요.
 *
 * 설정 방법:
 * 1. 이 파일을 blog.config.ts로 복사
 *    cp blog.config.example.ts blog.config.ts
 *
 * 2. .env.local 파일 생성 및 환경변수 설정
 *    - NOTION_API_KEY: Notion Integration Secret Key
 *    - NOTION_DATABASE_ID: Notion Database ID
 *    - NEXT_PUBLIC_BLOG_URL: 블로그 URL
 *    - NEXT_PUBLIC_GISCUS_* (선택): Giscus 댓글 설정
 *    - NEXT_PUBLIC_GA_ID (선택): Google Analytics ID
 *    - NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION (선택): Google Search Console 토큰
 *
 * 3. 아래 설정에서 직접 수정이 필요한 부분 변경
 *    - blog: 블로그 메타 정보
 *    - author: 작성자 정보
 *    - social: 소셜 미디어 링크
 */

export const blogConfig = {
  // Notion 설정
  notion: {
    apiKey: process.env.NOTION_API_KEY || '',
    databaseId: process.env.NOTION_DATABASE_ID || '',

    // Notion 데이터베이스 속성 매핑 (커스터마이징 가능)
    propertyMapping: {
      title: 'Title',
      slug: 'Slug',
      status: 'Status',
      publishDate: 'PublishDate',
      tags: 'Tags',
      category: 'Category',
      excerpt: 'Excerpt',
      coverImage: 'CoverImage',
      featured: 'Featured',
    },

    // 발행 상태 값
    publishedStatus: 'Published',
  },

  // 블로그 메타 정보 (직접 수정하세요)
  blog: {
    name: 'My Blog',                                    // 블로그 이름
    description: 'A blog powered by Notion and Next.js', // 블로그 설명
    url: process.env.NEXT_PUBLIC_BLOG_URL as string,    // 블로그 URL (.env.local에서 설정)
    language: 'ko',                                      // 언어 코드
    locale: 'ko_KR',                                     // 로케일
  },

  // 작성자 정보 (직접 수정하세요)
  author: {
    name: 'Your Name',               // 작성자 이름
    email: 'your.email@example.com', // 작성자 이메일
  },

  // 소셜 미디어 링크 (직접 수정하세요)
  social: {
    github: 'https://github.com/yourusername',     // GitHub 프로필
    twitter: 'https://twitter.com/yourusername',   // Twitter 프로필
    linkedin: 'https://linkedin.com/in/yourusername', // LinkedIn 프로필
  },

  // 기능 토글
  features: {
    search: true,          // 검색 기능
    darkMode: true,        // 다크 모드
    comments: true,        // 댓글 (Giscus)
    analytics: true,       // Vercel Analytics
    pwa: false,            // PWA
    tableOfContents: true, // 목차
    readingTime: true,     // 읽기 시간
  },

  // 페이지네이션 설정
  pagination: {
    postsPerPage: 10, // 한 페이지에 표시할 포스트 수
  },

  // 홈페이지 설정
  homepage: {
    recentPostsCount: 9,  // 홈페이지에 표시할 최신 포스트 수
    categoriesCount: 6,   // 홈페이지에 표시할 카테고리 수
    tagsCount: 12,        // 홈페이지에 표시할 태그 수
  },

  // Giscus 댓글 설정 (.env.local에서 설정)
  giscus: {
    repo: process.env.NEXT_PUBLIC_GISCUS_REPO || '',
    repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '',
    category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || '',
    categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
  },

  // Google Analytics (.env.local에서 설정)
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
  },

  // 테마 설정
  theme: {
    primaryColor: '#3B82F6', // blue-500
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
  },

  // 네비게이션 메뉴
  navigation: [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Categories', href: '/categories' },
    { name: 'Tags', href: '/tags' },
    { name: 'About', href: '/about' },
  ],

  // ISR 설정
  revalidate: {
    posts: 3600,    // 1시간 (단위: 초)
    postList: 3600, // 1시간 (단위: 초)
  },
} as const;

export type BlogConfig = typeof blogConfig;
