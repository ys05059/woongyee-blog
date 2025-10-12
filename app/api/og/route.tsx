/**
 * OG 이미지 동적 생성 API
 */

import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { blogConfig } from '@/blog.config';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || blogConfig.blog.name;
    const description = searchParams.get('description') || blogConfig.blog.description;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '80px',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
          }}
        >
          {/* 제목 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: '#ffffff',
                lineHeight: 1.2,
                margin: 0,
                maxWidth: '1000px',
              }}
            >
              {title}
            </h1>
            {description && (
              <p
                style={{
                  fontSize: '32px',
                  color: '#94a3b8',
                  margin: 0,
                  maxWidth: '900px',
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* 블로그 정보 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              {blogConfig.blog.name.charAt(0)}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {blogConfig.blog.name}
              </span>
              <span
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                }}
              >
                {blogConfig.author.name}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
