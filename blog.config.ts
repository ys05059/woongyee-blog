/**
 * Blog Configuration
 * 환경변수와 정적 설정을 통합하여 관리하는 중앙 설정 파일
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

  // 블로그 메타 정보
  blog: {
    name: process.env.NEXT_PUBLIC_BLOG_NAME || 'My Blog',
    description: process.env.NEXT_PUBLIC_BLOG_DESCRIPTION || 'A blog powered by Notion',
    url: process.env.NEXT_PUBLIC_BLOG_URL || 'https://example.com',
    language: 'ko',
    locale: 'ko_KR',
  },

  // 작성자 정보
  author: {
    name: process.env.NEXT_PUBLIC_AUTHOR_NAME || 'Anonymous',
    email: process.env.NEXT_PUBLIC_AUTHOR_EMAIL || '',
  },

  // 소셜 미디어 링크
  social: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
    linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
  },

  // 기능 토글
  features: {
    search: true,
    darkMode: true,
    comments: true,
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    pwa: false,
    tableOfContents: true,
    readingTime: true,
  },

  // 페이지네이션 설정
  pagination: {
    postsPerPage: Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE) || 10,
  },

  // 홈페이지 설정
  homepage: {
    recentPostsCount: 9, // 홈페이지에 표시할 최신 포스트 수
    categoriesCount: 6, // 홈페이지에 표시할 카테고리 수
    tagsCount: 12, // 홈페이지에 표시할 태그 수
  },

  // Giscus 댓글 설정
  giscus: {
    repo: process.env.NEXT_PUBLIC_GISCUS_REPO || '',
    repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || '',
    category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || '',
    categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || '',
  },

  // Google Analytics
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
    posts: 3600, // 1시간
    postList: 3600, // 1시간
  },
} as const;

export type BlogConfig = typeof blogConfig;
