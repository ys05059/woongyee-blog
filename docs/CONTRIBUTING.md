# Contributing to notion-based-next-blog

Thank you for your interest in contributing! This is a starter template project, and contributions are welcome.

## How to Contribute

### Reporting Issues

If you find bugs or have feature requests:
1. Go to [GitHub Issues](https://github.com/YOUR_USERNAME/notion-based-next-blog/issues)
2. Check if a similar issue already exists
3. If not, create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Improvements

Have ideas to improve this starter? Open an issue with the "enhancement" label and describe:
- What problem it solves
- How it would help users
- Suggested implementation approach

### Submitting Pull Requests

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally
3. **Create a branch** for your feature: `git checkout -b feature/your-feature-name`
4. **Make your changes** following the code style guidelines below
5. **Test thoroughly** - run `npm run build` and check for errors
6. **Commit your changes** with clear commit messages (see format below)
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Open a Pull Request** to the main repository

**Note**: This is a starter template, so PRs should focus on:
- Bug fixes
- Performance improvements
- Documentation improvements
- New features that benefit most users

Avoid PRs that are too specific to your personal use case.

## Development Setup

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Git

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/notion-based-next-blog.git
   cd notion-based-next-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Notion credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Project Structure

```
notion-based-next-blog/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utilities and libraries
│   ├── notion/            # Notion API integration
│   └── utils/             # Helper functions
├── blog.config.ts         # Central configuration
└── public/                # Static assets
```

### Key Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Notion API v5** - Content management
- **unified/remark/rehype** - Markdown processing

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types/interfaces
- Avoid `any` when possible
- Use meaningful variable names

```typescript
// Good
interface PostMeta {
  id: string;
  title: string;
  slug: string;
}

// Avoid
const data: any = fetchSomething();
```

### React Components

- Use functional components
- Prefer Server Components when possible
- Use Client Components ('use client') only when needed
- Keep components small and focused

```typescript
// Server Component (default)
export async function PostList() {
  const posts = await getPublishedPosts();
  return <div>{/* ... */}</div>;
}

// Client Component (when needed)
'use client';
export function SearchBar() {
  const [query, setQuery] = useState('');
  return <input />;
}
```

### Styling

- Use Tailwind CSS classes
- Follow existing design patterns
- Maintain consistency with minimal design
- Use semantic color names from theme

```typescript
// Good
<div className="text-muted-foreground hover:text-foreground transition-colors">

// Avoid inline styles
<div style={{ color: '#666' }}>
```

### File Naming

- Components: PascalCase (`PostCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Pages: lowercase (`page.tsx`, `layout.tsx`)

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body (optional)>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat: Add category filter to blog list

fix: Resolve Notion API v5 data_sources error

docs: Update setup guide with Giscus instructions

refactor: Extract markdown processing to utility function
```

## Testing

Before submitting a PR:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Check for TypeScript errors**
   ```bash
   npm run type-check  # or tsc --noEmit
   ```

3. **Run linter**
   ```bash
   npm run lint
   ```

4. **Test in browser**
   - Homepage loads correctly
   - Blog posts display properly
   - Search works
   - Categories and tags work
   - Navigation is functional

## Pull Request Process

1. **Update documentation** if needed
2. **Add comments** for complex logic
3. **Keep PRs focused** - one feature/fix per PR
4. **Write clear PR description**:
   - What does this PR do?
   - Why is this change needed?
   - How has it been tested?
   - Screenshots (if UI changes)

5. **Link related issues** using keywords:
   ```markdown
   Closes #123
   Fixes #456
   ```

6. **Be responsive** to review feedback
7. **Keep commits clean** - squash if needed

## Areas for Contribution

### Good First Issues

- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage
- Accessibility improvements

### Feature Ideas

- Pagination for blog list
- RSS feed generation
- Dark mode toggle UI
- Table of contents for posts
- Reading progress indicator
- Related posts suggestions
- Post series/collections
- Multi-language support

### Performance Improvements

- Image optimization
- Code splitting
- Caching strategies
- Bundle size reduction

## Questions?

- Check [existing issues](https://github.com/YOUR_USERNAME/notion-based-next-blog/issues)
- Review [Setup Guide](./SETUP_GUIDE.md)
- Open a [discussion](https://github.com/YOUR_USERNAME/notion-based-next-blog/discussions)

Thank you for contributing! 🎉
