/**
 * Notion Webhook Handler
 * Notion 데이터베이스의 페이지가 변경되면 자동으로 해당 포스트를 재검증
 *
 * 처리 가능한 이벤트:
 * - page.created: 새 페이지 생성 시 → Published면 포스트 + 목록 재검증
 * - page.content_updated: 페이지 내용 업데이트 시 → Published면 포스트 + 목록 재검증
 * - page.properties_updated: 페이지 속성 업데이트 시 (Status 변경 포함) → Published면 포스트 + 목록 재검증
 * - page.deleted: 페이지 삭제 시 → 목록 재검증
 *
 * Draft 필터링:
 * - Status가 "Published"가 아닌 페이지는 재검증하지 않음
 * - Draft → Published 전환 시 page.properties_updated 이벤트로 감지
 *
 * Notion Integration 설정:
 * 1. https://www.notion.so/my-integrations 에서 Integration 생성
 * 2. Capabilities에서 "Read content" 권한 활성화
 * 3. Webhooks 섹션에서 webhook 추가:
 *    - Event Subscriptions: "Page updated" (모든 page.* 이벤트 포함)
 *    - Endpoint URL: https://yourdomain.com/api/webhook/notion
 *    - Filter: 블로그 데이터베이스 선택
 * 4. Integration을 블로그 데이터베이스에 연결
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getPostSlugByPageId } from '@/lib/notion/api';
import { extractAndUploadImages } from '@/lib/notion/images';
import crypto from 'crypto';

// Notion Webhook 이벤트 타입 정의
interface NotionWebhookEvent {
  type:
    | 'page.created'
    | 'page.content_updated'
    | 'page.properties_updated'
    | 'page.deleted';
  entity: {
    id: string;
    type: 'page';
  };
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
        const pageId = event.entity?.id;
        if (!pageId) {
          console.warn('No page ID in webhook event');
          return { error: 'No page ID' };
        }

        // 페이지 삭제 이벤트 처리
        if (event.type === 'page.deleted') {
          console.log(`Page deleted: ${pageId} - revalidating blog list`);

          // 삭제된 페이지는 정보를 가져올 수 없으므로 전체 목록만 재검증
          try {
            revalidateTag('posts');
            console.log('Successfully revalidated posts tag');

            // Sitemap도 재검증 (삭제된 포스트 sitemap에서 제거)
            revalidatePath('/sitemap.xml');
            console.log('Successfully revalidated sitemap');
          } catch (error) {
            console.error('Revalidation error:', error);
            return { error: 'Revalidation failed', details: error instanceof Error ? error.message : 'Unknown error' };
          }

          return {
            success: true,
            type: 'deleted',
            pageId,
            revalidated: ['tag:posts'],
          };
        }

        // 페이지 생성/업데이트 이벤트 처리
        const eventTypeLabel =
          event.type === 'page.created' ? 'created' :
          event.type === 'page.properties_updated' ? 'properties updated' :
          event.type === 'page.content_updated' ? 'content updated' : 'updated';

        console.log(`Page ${eventTypeLabel}: ${pageId}`);

        // 페이지 ID로 slug와 발행 상태 조회
        const pageInfo = await getPostSlugByPageId(pageId);

        if (!pageInfo) {
          console.warn(`Could not fetch page info for ${pageId}`);
          return { error: 'Failed to fetch page info', pageId };
        }

        const { slug, isPublished } = pageInfo;

        // Draft 상태면 skip (Published가 아니면 처리하지 않음)
        if (!isPublished) {
          console.log(`Page ${pageId} is not published (Draft) - skipping revalidation`);
          return {
            success: true,
            type: event.type,
            pageId,
            skipped: true,
            reason: 'Page is not published'
          };
        }

        console.log(`Processing published page: ${slug}`);

        // 이미지 추출 및 Cloudinary 업로드
        try {
          console.log(`Extracting and uploading images for page ${pageId}...`);
          const imageInfos = await extractAndUploadImages(pageId);
          console.log(`✓ Processed ${imageInfos.length} images`);
        } catch (error) {
          console.error(`Failed to process images for page ${pageId}:`, error);
          // 이미지 처리 실패해도 revalidation은 계속 진행
        }

        // 해당 블로그 포스트 페이지 재검증
        try {
          revalidatePath(`/blog/${slug}`);
          console.log(`Successfully revalidated /blog/${slug}`);

          // 블로그 목록 페이지도 재검증 (새 포스트나 업데이트된 포스트 반영)
          revalidateTag('posts');
          console.log('Successfully revalidated posts tag');

          // Sitemap 재검증 (새 포스트 추가/삭제 시 sitemap 업데이트)
          revalidatePath('/sitemap.xml');
          console.log('Successfully revalidated sitemap');
        } catch (error) {
          console.error('Revalidation error:', error);
          return { error: 'Revalidation failed', details: error instanceof Error ? error.message : 'Unknown error' };
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
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success && !r.value.skipped).length;
    const skipped = results.filter(r => r.status === 'fulfilled' && r.value.skipped).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)).length;

    console.log(`Webhook processing complete: ${successful} successful, ${skipped} skipped (Draft), ${failed} failed`);

    return NextResponse.json({
      success: true,
      processed: events.length,
      results: {
        successful,
        skipped,
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
  const isConfigured = !!process.env.NOTION_API_KEY;

  return NextResponse.json({
    status: 'ok',
    configured: isConfigured,
    message: isConfigured
      ? 'Notion webhook endpoint is ready.'
      : 'Missing required environment variables (NOTION_API_KEY).',
    requiredEnvVars: {
      NOTION_API_KEY: !!process.env.NOTION_API_KEY,
      NOTION_DATABASE_ID: !!process.env.NOTION_DATABASE_ID,
      NOTION_WEBHOOK_SECRET: !!process.env.NOTION_WEBHOOK_SECRET,
    },
  });
}
