/**
 * Cloudinary 이미지 업로드 유틸리티
 */

import crypto from 'crypto';
import { getCloudinaryClient } from './config';

/**
 * Notion 이미지 URL에서 파일 고유 ID 추출
 *
 * Notion URL 형식: https://s3.../notion-static.com/[UUID]/filename.jpg?Signature=...
 * 이미지 내용이 바뀌면 UUID도 바뀌므로 이를 이용해 파일 변경 감지
 *
 * @param notionUrl - Notion 이미지 URL
 * @returns 파일 고유 ID (UUID 또는 정규화된 URL)
 */
function extractNotionFileId(notionUrl: string): string {
  // UUID 패턴 매칭 (8-4-4-4-12 형식)
  const uuidPattern = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;
  const match = notionUrl.match(uuidPattern);

  if (match) {
    return match[1].toLowerCase();
  }

  // UUID가 없으면 query string을 제거한 URL 사용
  return notionUrl.split('?')[0];
}

/**
 * 파일 ID를 해시로 변환 (짧은 문자열)
 *
 * @param fileId - 파일 고유 ID
 * @returns MD5 해시 (8자리)
 */
function hashFileId(fileId: string): string {
  return crypto.createHash('md5').update(fileId).digest('hex').slice(0, 8);
}

/**
 * Cloudinary Public ID 생성
 *
 * 형식: blog/{pageId}/{blockId}_{fileHash}
 * - blockId: 이미지 블록의 고유 ID (블록 위치 식별)
 * - fileHash: 파일 내용의 해시 (파일 변경 감지)
 *
 * @param pageId - Notion 페이지 ID
 * @param blockId - 이미지 블록 ID
 * @param notionUrl - Notion 이미지 URL
 * @returns Cloudinary Public ID
 */
export function generatePublicId(
  pageId: string,
  blockId: string,
  notionUrl: string
): string {
  const fileId = extractNotionFileId(notionUrl);
  const fileHash = hashFileId(fileId);
  return `${pageId}/${blockId}_${fileHash}`;
}

/**
 * Notion 이미지를 Cloudinary로 업로드
 *
 * @param notionUrl - Notion 이미지 URL (1시간 유효)
 * @param pageId - Notion 페이지 ID
 * @param blockId - 이미지 블록 ID
 * @returns Cloudinary 영구 URL
 * @throws 업로드 실패 시 원본 URL 반환 (fallback)
 */
export async function uploadNotionImage(
  notionUrl: string,
  pageId: string,
  blockId: string
): Promise<string> {
  try {
    const cloudinary = getCloudinaryClient();
    const publicId = generatePublicId(pageId, blockId, notionUrl);

    console.log(`[Cloudinary] Uploading image: ${publicId}`);

    const result = await cloudinary.uploader.upload(notionUrl, {
      public_id: publicId,
      folder: 'blog',
      overwrite: false, // 같은 public_id면 재업로드하지 않음
      resource_type: 'auto', // 자동 타입 감지 (image, video 등)
      transformation: [
        { width: 1920, crop: 'limit' }, // 최대 너비 제한
        { quality: 'auto' }, // 자동 품질 최적화
        { fetch_format: 'auto' }, // 브라우저별 최적 포맷 (WebP, AVIF)
      ],
    });

    console.log(`[Cloudinary] ✓ Uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary] ✗ Upload failed:', error);
    console.warn('[Cloudinary] Fallback to Notion URL');

    // Fallback: 업로드 실패 시 원본 Notion URL 반환
    // (최소 1시간은 유효하므로 임시 대응 가능)
    return notionUrl;
  }
}

/**
 * 커버 이미지 업로드 (페이지 레벨)
 *
 * @param notionUrl - Notion 커버 이미지 URL
 * @param pageId - Notion 페이지 ID
 * @returns Cloudinary URL
 */
export async function uploadCoverImage(
  notionUrl: string,
  pageId: string
): Promise<string> {
  try {
    const cloudinary = getCloudinaryClient();
    const fileId = extractNotionFileId(notionUrl);
    const fileHash = hashFileId(fileId);
    const publicId = `${pageId}/cover_${fileHash}`;

    console.log(`[Cloudinary] Uploading cover: ${publicId}`);

    const result = await cloudinary.uploader.upload(notionUrl, {
      public_id: publicId,
      folder: 'blog',
      overwrite: false,
      resource_type: 'auto',
      transformation: [
        { width: 2400, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    console.log(`[Cloudinary] ✓ Cover uploaded: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary] ✗ Cover upload failed:', error);
    console.warn('[Cloudinary] Fallback to Notion URL');
    return notionUrl;
  }
}
