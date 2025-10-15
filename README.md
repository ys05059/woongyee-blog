# notion-based-next-blog

A modern, minimal blog starter built with Next.js 15 and Notion as a CMS. Fork this repository and deploy your own blog in minutes by just configuring environment variables.

## ✨ Features

- 📝 **Notion as CMS** - Write posts in Notion, publish automatically
- 🎨 **Minimal Design** - Clean, typography-focused interface
- 🚀 **Next.js 15** - App Router, Server Components, ISR
- 🔍 **Full-text Search** - Search posts by title, excerpt, and tags
- 🏷️ **Categories & Tags** - Organize posts with categories and tags
- 💬 **Giscus Comments** - GitHub Discussions-powered comments
- 📊 **Vercel Analytics** - Built-in analytics support
- 🎯 **SEO Optimized** - Sitemap, robots.txt, JSON-LD structured data
- 🖼️ **Dynamic OG Images** - Auto-generated Open Graph images
- ⚡ **ISR & Revalidation** - On-demand or time-based content updates
- 🌓 **Dark Mode Ready** - Theme support built-in
- 📱 **Responsive** - Mobile-first design

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **CMS**: Notion API v5 (2025-09-03)
- **Markdown**: unified, remark, rehype
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics
- **Comments**: Giscus (GitHub Discussions)

## 🚀 Quick Start

### 1. Fork this repository

Click the "Fork" button at the top right of this page.

### 2. Clone your forked repository

```bash
git clone https://github.com/YOUR_USERNAME/notion-based-next-blog.git
cd notion-based-next-blog
```

### 3. Install dependencies

```bash
npm install
```

### 4. Set up Notion

1. Create a [Notion Integration](https://www.notion.so/my-integrations)
2. Create a Notion database with the following properties:
   - `Title` (Title)
   - `Slug` (Text)
   - `Status` (Select: Published, Draft)
   - `PublishDate` (Date)
   - `Tags` (Multi-select)
   - `Category` (Select)
   - `Excerpt` (Text)
   - `CoverImage` (URL) - optional
   - `Featured` (Checkbox) - optional
3. Share the database with your integration
4. Copy the Database ID from the URL

### 5. Set up configuration files

Copy the example configuration to create your own:

```bash
cp docs/blog.config.example.ts blog.config.ts
cp docs/.env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Required
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BLOG_URL=https://yourdomain.com

# Optional - Google Search Console
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_token

# Optional - Giscus Comments
NEXT_PUBLIC_GISCUS_REPO=username/repo
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxx

# Optional - Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Optional - Revalidation Token
REVALIDATE_TOKEN=your_random_token
```

### 6. Customize your blog

Edit `blog.config.ts` to personalize your blog (see `docs/blog.config.example.ts` for all options):

```typescript
blog: {
  name: '내 블로그',  // 블로그 이름
  description: '설명',  // 블로그 설명
  url: 'https://yourdomain.com',  // 배포 URL
},
author: {
  name: '홍길동',
  email: 'your@email.com',
},
social: {
  github: 'https://github.com/username',
  // ...
}
```

### 7. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/notion-based-next-blog)

### Manual Deploy

1. Push your repository to GitHub (make sure `blog.config.ts` is included!)
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

**Note**: `blog.config.ts` is in `.gitignore` by default to protect sensitive info. Remove it from `.gitignore` if you want to commit it, or configure it separately in your deployment environment.

### Post-Deployment Setup

#### On-Demand Revalidation (Optional)

Set up a Notion webhook to revalidate content when you publish:

```bash
curl -X POST https://yourdomain.com/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-token: YOUR_REVALIDATE_TOKEN" \
  -d '{"tag": "posts"}'
```

**Note**: Notion webhooks require a public URL and are not available in local development.

## 🎨 Customization

All blog customization is done in `blog.config.ts`. See `docs/blog.config.example.ts` for complete configuration with detailed comments.

### Blog Information

```typescript
blog: {
  name: 'My Blog',
  description: 'A blog powered by Notion and Next.js',
  url: process.env.NEXT_PUBLIC_BLOG_URL as string,  // From .env.local
},
author: {
  name: 'Your Name',
  email: 'your.email@example.com',
},
social: {
  github: 'https://github.com/yourusername',
  twitter: 'https://twitter.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
},
```

### Homepage Settings

```typescript
homepage: {
  recentPostsCount: 9,    // Number of recent posts to show
  categoriesCount: 6,      // Number of categories to show
  tagsCount: 12,           // Number of tags to show
}
```

### Navigation Menu

```typescript
navigation: [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Categories', href: '/categories' },
  { name: 'Tags', href: '/tags' },
  { name: 'About', href: '/about' },
]
```

### Notion Property Mapping

If you use different property names in your Notion database:

```typescript
propertyMapping: {
  title: 'Title',
  slug: 'Slug',
  status: 'Status',
  publishDate: 'PublishDate',
  // ... customize as needed
}
```

## 📝 Writing Posts

1. Create a new page in your Notion database
2. Fill in all required properties
3. Write your content (supports all Notion blocks)
4. Set `Status` to "Published"
5. Your post will appear on your blog (revalidation time: 1 hour by default)

## 🔧 Development

### Project Structure

```
notion-based-next-blog/
├── app/                          # Next.js App Router
│   ├── about/                    # About page
│   ├── api/                      # API routes
│   │   ├── og/                   # OG image generation
│   │   └── revalidate/           # On-demand revalidation
│   ├── blog/                     # Blog pages
│   │   └── [slug]/               # Dynamic post pages
│   ├── categories/               # Category pages
│   ├── tags/                     # Tag pages
│   ├── search/                   # Search page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── blog/                     # Blog-specific components
│   ├── common/                   # Shared components
│   └── layout/                   # Layout components
├── lib/                          # Utilities and libraries
│   ├── notion/                   # Notion API integration
│   └── utils/                    # Helper functions
├── blog.config.ts                # Central configuration (gitignored)
└── docs/                         # Documentation
    ├── blog.config.example.ts    # Blog configuration template
    ├── .env.example              # Environment variables template
    ├── SETUP_GUIDE.md
    ├── CONTRIBUTING.md
    └── CHANGELOG.md
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📚 Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md) - Detailed setup instructions
- [Contributing](./docs/CONTRIBUTING.md) - How to contribute
- [Changelog](./docs/CHANGELOG.md) - Version history

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Notion API](https://developers.notion.com/)
- Deployed on [Vercel](https://vercel.com/)
- UI inspired by minimal design principles

## 💬 Support

If you have any questions or issues, please:
1. Check the [Setup Guide](./docs/SETUP_GUIDE.md)
2. Search [existing issues](https://github.com/YOUR_USERNAME/notion-based-next-blog/issues)
3. Create a [new issue](https://github.com/YOUR_USERNAME/notion-based-next-blog/issues/new)

---

Made with ❤️ using Notion and Next.js
