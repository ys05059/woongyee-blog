/**
 * On-Demand Revalidation API
 * Notion에서 콘텐츠가 변경되었을 때 캐시를 즉시 갱신
 *
 * 사용법:
 * POST /api/revalidate
 * Headers: x-revalidate-token: <REVALIDATE_TOKEN>
 * Body: { path?: string, tag?: string }
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 비밀 토큰 검증
    const token = request.headers.get('x-revalidate-token');
    const expectedToken = process.env.REVALIDATE_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        { error: 'Revalidation is not configured. Set REVALIDATE_TOKEN in your environment variables.' },
        { status: 500 }
      );
    }

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { path, tag } = body;

    // Path 기반 revalidation
    if (path) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        value: path,
        now: Date.now(),
      });
    }

    // Tag 기반 revalidation
    if (tag) {
      revalidateTag(tag);
      console.log(`Revalidated tag: ${tag}`);
      return NextResponse.json({
        revalidated: true,
        type: 'tag',
        value: tag,
        now: Date.now(),
      });
    }

    // 기본: 전체 블로그 revalidation
    revalidatePath('/');
    revalidatePath('/blog');
    console.log('Revalidated all blog pages');

    return NextResponse.json({
      revalidated: true,
      type: 'all',
      paths: ['/', '/blog'],
      now: Date.now(),
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET 요청 - 상태 확인용
export async function GET() {
  const isConfigured = !!process.env.REVALIDATE_TOKEN;

  return NextResponse.json({
    status: 'ok',
    configured: isConfigured,
    message: isConfigured
      ? 'Revalidation API is ready. Use POST with x-revalidate-token header.'
      : 'REVALIDATE_TOKEN is not set. Please configure it in your environment variables.',
  });
}
