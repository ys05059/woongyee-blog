# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Initial Development

A Next.js 15 blog starter using Notion as CMS.

#### Features
- Notion API v5 integration with full markdown support
- Homepage with recent posts, categories, and tags
- Blog list and individual post pages
- Category and tag filtering
- Search functionality
- About page with section navigation
- Giscus comments integration
- Vercel Analytics support
- SEO optimization (sitemap, robots.txt, JSON-LD)
- Dynamic OG image generation
- ISR with on-demand revalidation
- Responsive design with Tailwind CSS 4

#### Pages
- `/` - Homepage
- `/blog` - All posts
- `/blog/[slug]` - Individual post
- `/about` - About page
- `/categories` - Categories index
- `/categories/[category]` - Posts by category
- `/tags` - Tags index
- `/tags/[tag]` - Posts by tag
- `/search` - Search results
- `/api/revalidate` - On-demand revalidation
- `/api/og` - Dynamic OG image generation

#### Configuration
- Centralized config in `blog.config.ts`
- Customizable navigation, property mapping, and ISR settings
- Environment variables for easy deployment

---

## How to Read Version Numbers

Given a version number MAJOR.MINOR.PATCH:
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backward compatible manner
- **PATCH** version for backward compatible bug fixes
