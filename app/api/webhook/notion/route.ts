/**
 * Notion Webhook Handler
 * Notion 데이터베이스의 페이지가 변경되면 자동으로 해당 포스트를 재검증
 *
 * 처리 가능한 이벤트:
 * - page_created: 새 페이지 생성 시 → 해당 포스트 + 목록 재검증
 * - page_content_updated: 페이지 업데이트 시 → 해당 포스트 + 목록 재검증
 * - page_deleted: 페이지 삭제 시 → 목록 재검증
 *
 * Notion Integration 설정:
 * 1. https://www.notion.so/my-integrations 에서 Integration 생성
 * 2. Capabilities에서 "Read content" 권한 활성화
 * 3. Webhooks 섹션에서 webhook 추가:
 *    - Event Subscriptions: "Page created", "Page content updated", "Page deleted"
 *    - Endpoint URL: https://yourdomain.com/api/webhook/notion
 *    - Filter: 블로그 데이터베이스 선택
 * 4. Integration을 블로그 데이터베이스에 연결
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPostSlugByPageId } from '@/lib/notion/api';
import crypto from 'crypto';

// Notion Webhook 이벤트 타입 정의
interface NotionWebhookEvent {
  type: 'page_content_updated' | 'page_created' | 'page_deleted';
  page_id: string;
  workspace_id?: string;
}

/**
 * HMAC-SHA256 서명 검증
 * Notion webhook signature format: "sha256=<hex>"
 */
function verifySignature(body: string, signature: string, secret: string): boolean {
  // body를 파싱한 후 다시 JSON.stringify (Notion 문서 방식)
  const parsedBody = JSON.parse(body);
  const stringifiedBody = JSON.stringify(parsedBody);

  // 서명 계산: sha256=<hex> 형식
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(stringifiedBody);
  const calculatedSignature = `sha256=${hmac.digest('hex')}`;

  console.log('Signature verification:', {
    received: signature,
    calculated: calculatedSignature,
    match: signature === calculatedSignature
  });

  // Timing attack 방지를 위한 constant-time 비교
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('timingSafeEqual error:', error);
    // 길이가 다르면 timingSafeEqual이 에러 발생하므로 일반 비교
    return signature === calculatedSignature;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 요청 본문을 문자열로 읽기 (서명 검증용)
    const bodyText = await request.text();

    // Webhook Signature 검증 (권장)
    const webhookSecret = process.env.NOTION_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-notion-signature');

      if (!signature) {
        console.warn('Missing webhook signature');
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }

      try {
        if (!verifySignature(bodyText, signature, webhookSecret)) {
          console.warn('Invalid webhook signature');
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          );
        }
      } catch (error) {
        console.error('Signature verification error:', error);
        return NextResponse.json(
          { error: 'Signature verification failed' },
          { status: 401 }
        );
      }
    }

    // 요청 본문 파싱
    const body = JSON.parse(bodyText);
    console.log('Received Notion webhook:', JSON.stringify(body, null, 2));

    // URL Verification Challenge 처리 (webhook 생성 시 Notion이 보내는 초기 요청)
    if (body.type === 'url_verification') {
      console.log('URL verification challenge received');
      return NextResponse.json({
        challenge: body.challenge,
      });
    }

    // Notion webhook 이벤트 배열 처리
    const events: NotionWebhookEvent[] = body.events || [body];

    // 각 이벤트 처리
    const results = await Promise.allSettled(
      events.map(async (event) => {
        const pageId = event.page_id;
        if (!pageId) {
          console.warn('No page_id in webhook event');
          return { error: 'No page_id' };
        }

        // Revalidate API 호출을 위한 공통 설정
        const revalidateToken = process.env.REVALIDATE_TOKEN;
        if (!revalidateToken) {
          console.error('REVALIDATE_TOKEN is not configured');
          return { error: 'REVALIDATE_TOKEN not configured' };
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                       process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                       'http://localhost:3000';

        // 페이지 삭제 이벤트 처리
        if (event.type === 'page_deleted') {
          console.log(`Page deleted: ${pageId} - revalidating blog list`);

          // 삭제된 페이지는 정보를 가져올 수 없으므로 전체 목록만 재검증
          const listRevalidateResponse = await fetch(`${baseUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-revalidate-token': revalidateToken,
            },
            body: JSON.stringify({
              tag: 'posts', // posts 태그를 사용하는 모든 페이지 재검증
            }),
          });

          if (!listRevalidateResponse.ok) {
            const errorText = await listRevalidateResponse.text();
            console.error('List revalidation failed:', errorText);
            return { error: 'List revalidation failed', details: errorText };
          }

          return {
            success: true,
            type: 'deleted',
            pageId,
            revalidated: ['tag:posts'],
          };
        }

        // 페이지 생성/업데이트 이벤트 처리
        console.log(`Page ${event.type === 'page_created' ? 'created' : 'updated'}: ${pageId}`);

        // 페이지 ID로 slug 조회
        const slug = await getPostSlugByPageId(pageId);

        if (!slug) {
          console.warn(`Could not find slug for page ${pageId} - might not be a published post`);
          // Slug를 못 찾아도 목록은 재검증 (발행 상태가 변경되었을 수 있음)
          await fetch(`${baseUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-revalidate-token': revalidateToken,
            },
            body: JSON.stringify({ tag: 'posts' }),
          });

          return {
            success: true,
            type: event.type,
            pageId,
            note: 'Slug not found, revalidated list only',
            revalidated: ['tag:posts']
          };
        }

        // 해당 블로그 포스트 페이지 재검증
        const revalidateResponse = await fetch(`${baseUrl}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidate-token': revalidateToken,
          },
          body: JSON.stringify({
            path: `/blog/${slug}`,
          }),
        });

        if (!revalidateResponse.ok) {
          const errorText = await revalidateResponse.text();
          console.error('Revalidation failed:', errorText);
          return { error: 'Revalidation failed', details: errorText };
        }

        const revalidateData = await revalidateResponse.json();
        console.log(`Successfully revalidated /blog/${slug}`, revalidateData);

        // 블로그 목록 페이지도 재검증 (새 포스트나 업데이트된 포스트 반영)
        const listRevalidateResponse = await fetch(`${baseUrl}/api/revalidate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-revalidate-token': revalidateToken,
          },
          body: JSON.stringify({
            tag: 'posts', // posts 태그를 사용하는 모든 페이지 재검증
          }),
        });

        if (!listRevalidateResponse.ok) {
          console.warn('Failed to revalidate posts list');
        }

        return {
          success: true,
          type: event.type,
          pageId,
          slug,
          revalidated: [`/blog/${slug}`, 'tag:posts'],
        };
      })
    );

    // 결과 요약
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length;

    console.log(`Webhook processing complete: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      processed: events.length,
      results: {
        successful,
        failed,
      },
      details: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason }),
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET 요청 - 상태 확인용
export async function GET() {
  const isConfigured = !!(
    process.env.REVALIDATE_TOKEN &&
    process.env.NOTION_API_KEY
  );

  return NextResponse.json({
    status: 'ok',
    configured: isConfigured,
    message: isConfigured
      ? 'Notion webhook endpoint is ready.'
      : 'Missing required environment variables (REVALIDATE_TOKEN, NOTION_API_KEY).',
    requiredEnvVars: {
      REVALIDATE_TOKEN: !!process.env.REVALIDATE_TOKEN,
      NOTION_API_KEY: !!process.env.NOTION_API_KEY,
      NOTION_WEBHOOK_SECRET: !!process.env.NOTION_WEBHOOK_SECRET,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    },
  });
}
