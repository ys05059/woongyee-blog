# Setup Guide

This guide provides detailed instructions for setting up your notion-based-next-blog.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Notion Setup](#notion-setup)
- [Environment Variables](#environment-variables)
- [Giscus Comments Setup](#giscus-comments-setup)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18.17 or later
- npm or yarn
- A Notion account
- A GitHub account (for Giscus comments)
- A Vercel account (for deployment)

## Notion Setup

### Step 1: Create a Notion Integration

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "My Blog")
4. Select the workspace where your blog database will be
5. Click "Submit"
6. Copy the "Internal Integration Token" - this is your `NOTION_API_KEY`

### Step 2: Create a Notion Database

1. Create a new page in Notion
2. Add a database (Full page or Inline)
3. Add the following properties:

#### Required Properties

| Property Name | Property Type | Description |
|--------------|---------------|-------------|
| Title | Title | Post title (default property) |
| Slug | Text | URL-friendly slug (e.g., "my-first-post") |
| Status | Select | Publication status (options: Published, Draft) |
| PublishDate | Date | Publication date |
| Tags | Multi-select | Post tags |
| Category | Select | Post category |
| Excerpt | Text | Short description/summary |

#### Optional Properties

| Property Name | Property Type | Description |
|--------------|---------------|-------------|
| CoverImage | URL | Cover image URL |
| Featured | Checkbox | Featured post flag |

**Important**: Property names must match exactly (including capitalization) unless you customize them in `blog.config.ts`.

### Step 3: Share Database with Integration

1. Open your database in Notion
2. Click the "..." menu at the top right
3. Click "Add connections"
4. Search for and select your integration
5. Click "Confirm"

### Step 4: Get Database ID

The Database ID is in your database URL:

```
https://www.notion.so/{workspace}/{database_id}?v={view_id}
```

Copy the `database_id` part (32 characters, no hyphens).

**Example**:
- URL: `https://www.notion.so/myworkspace/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p?v=...`
- Database ID: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

## Environment Variables

### Required Variables

```bash
# Notion Configuration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Blog Information

```bash
# Blog Metadata
NEXT_PUBLIC_BLOG_NAME=My Awesome Blog
NEXT_PUBLIC_BLOG_DESCRIPTION=Thoughts on tech, design, and life
NEXT_PUBLIC_BLOG_URL=https://yourdomain.com

# Author Information
NEXT_PUBLIC_AUTHOR_NAME=Your Name
NEXT_PUBLIC_AUTHOR_EMAIL=you@example.com
```

### Social Media Links (Optional)

```bash
NEXT_PUBLIC_GITHUB_URL=https://github.com/username
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/username
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/in/username
```

### Feature Toggles

```bash
# Pagination
NEXT_PUBLIC_POSTS_PER_PAGE=10

# Analytics (Vercel Analytics)
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Revalidation Token (Optional but Recommended)

Generate a random token for on-demand revalidation:

```bash
# macOS/Linux
openssl rand -base64 32

# Or use any random string generator
REVALIDATE_TOKEN=your_very_secure_random_token_here
```

## Giscus Comments Setup

Giscus uses GitHub Discussions as a backend for comments.

### Step 1: Enable GitHub Discussions

1. Go to your GitHub repository
2. Click "Settings"
3. Scroll down to "Features"
4. Check "Discussions"

### Step 2: Install Giscus App

1. Go to [https://github.com/apps/giscus](https://github.com/apps/giscus)
2. Click "Install"
3. Select your blog repository
4. Click "Install"

### Step 3: Configure Giscus

1. Go to [https://giscus.app](https://giscus.app)
2. Enter your repository name (e.g., `username/blog`)
3. Select "Discussion Category": Choose "Announcements" (recommended)
4. Select mapping: Choose "pathname" (default)
5. Copy the generated values:

```bash
NEXT_PUBLIC_GISCUS_REPO=username/repository
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxxxxxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Announcements
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxxxxxxxxxxx
```

**Note**: Comments will only appear on deployed site, not in local development.

## Deployment

### Deploy to Vercel

#### Option 1: One-Click Deploy

1. Click the "Deploy with Vercel" button in README
2. Connect your GitHub account
3. Fork the repository
4. Add environment variables
5. Deploy

#### Option 2: Manual Deploy

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variables from your `.env.local`
7. Click "Deploy"

### Environment Variables in Vercel

Add all variables from your `.env.local`:

1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add each variable:
   - Key: Variable name (e.g., `NOTION_API_KEY`)
   - Value: Variable value
   - Environment: Select all (Production, Preview, Development)
4. Click "Save"

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_BLOG_URL` with your custom domain

## Post-Deployment Configuration

### On-Demand Revalidation Setup

To automatically revalidate content when you publish in Notion:

1. Set up a webhook trigger (requires third-party service like n8n or Zapier)
2. Configure webhook to call your revalidation endpoint:

```bash
POST https://yourdomain.com/api/revalidate
Headers:
  Content-Type: application/json
  x-revalidate-token: YOUR_REVALIDATE_TOKEN
Body:
  {"tag": "posts"}
```

**Note**: Notion doesn't support webhooks directly. You'll need to use:
- n8n (self-hosted or cloud)
- Zapier
- Make (formerly Integromat)
- Or wait for the ISR time (1 hour by default)

## Troubleshooting

### "This database does not have any data sources"

**Problem**: Cannot fetch posts from Notion.

**Solutions**:
1. Ensure you've shared the database with your integration
2. Check that `NOTION_DATABASE_ID` is correct (no hyphens)
3. Verify your integration has access to the workspace

### Posts Not Appearing

**Problem**: Published posts don't show up on the blog.

**Solutions**:
1. Check that `Status` property is exactly "Published"
2. Verify `PublishDate` is not in the future
3. Check property names match exactly (case-sensitive)
4. Wait for revalidation (up to 1 hour) or trigger manually

### Build Errors

**Problem**: Build fails with Notion API errors.

**Solutions**:
1. Verify all required environment variables are set
2. Check Notion API key is valid
3. Ensure database has at least one published post for build
4. Check property names in `blog.config.ts`

### Comments Not Working

**Problem**: Giscus comments don't load.

**Solutions**:
1. Verify GitHub Discussions is enabled
2. Check all Giscus environment variables are correct
3. Ensure repository is public (Giscus requires public repo)
4. Comments only work on deployed site, not localhost

### Styles Not Loading

**Problem**: Page looks unstyled or broken.

**Solutions**:
1. Clear `.next` folder: `rm -rf .next`
2. Rebuild: `npm run build`
3. Check Tailwind CSS configuration
4. Verify `globals.css` is imported in `app/layout.tsx`

### ISR Not Working

**Problem**: Content doesn't update after 1 hour.

**Solutions**:
1. Check `revalidate` values in `blog.config.ts`
2. Trigger manual revalidation via API endpoint
3. Check Vercel deployment logs for errors
4. Verify `unstable_cache` is configured correctly

## Advanced Configuration

### Custom Property Names

If you want to use different property names in Notion, update `blog.config.ts`:

```typescript
propertyMapping: {
  title: 'MyTitle',        // Instead of 'Title'
  slug: 'MySlug',          // Instead of 'Slug'
  status: 'MyStatus',      // Instead of 'Status'
  // ... etc
}
```

### Custom Published Status

If you use a different status value (e.g., "Live" instead of "Published"):

```typescript
publishedStatus: 'Live',  // Instead of 'Published'
```

### Adjust Revalidation Times

Change how often content is revalidated:

```typescript
revalidate: {
  posts: 1800,      // 30 minutes (in seconds)
  postList: 1800,   // 30 minutes
}
```

## Need More Help?

- Check [GitHub Issues](https://github.com/YOUR_USERNAME/notion-based-next-blog/issues)
- Read [Next.js Documentation](https://nextjs.org/docs)
- Review [Notion API Documentation](https://developers.notion.com/)
- Join [Vercel Discord](https://vercel.com/discord)
