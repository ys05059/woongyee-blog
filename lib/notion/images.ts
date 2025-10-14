/**
 * Notion 이미지 추출 및 Cloudinary 업로드
 */

import { getNotionClient } from './client';
import { uploadNotionImage } from '@/lib/cloudinary/upload';
import { isCloudinaryConfigured } from '@/lib/cloudinary/config';

/**
 * 이미지 정보 타입
 */
export interface ImageInfo {
  /** 이미지 블록 ID */
  blockId: string;
  /** 원본 Notion URL */
  notionUrl: string;
  /** Cloudinary URL */
  cloudinaryUrl: string;
}

/**
 * Notion 블록 타입 정의 (이미지 관련만)
 */
interface NotionBlock {
  id: string;
  type: string;
  has_children?: boolean;
  image?: {
    type: 'file' | 'external';
    file?: {
      url: string;
    };
    external?: {
      url: string;
    };
  };
}

/**
 * Notion 블록에서 이미지 URL 추출
 *
 * @param block - Notion 블록
 * @returns 이미지 URL 또는 null (유효한 HTTP/HTTPS URL만 반환)
 */
function extractImageUrl(block: NotionBlock): string | null {
  if (block.type !== 'image' || !block.image) {
    return null;
  }

  const image = block.image;
  let url: string | null = null;

  // Notion UI에서 업로드한 파일 (type: file)
  if (image.type === 'file' && image.file?.url) {
    url = image.file.url;
  }
  // 외부 URL로 추가한 이미지 (type: external)
  else if (image.type === 'external' && image.external?.url) {
    url = image.external.url;
  }

  // 유효한 HTTP/HTTPS URL인지 검증
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return url;
  }

  // 로컬 경로나 유효하지 않은 URL은 null 반환
  return null;
}

/**
 * 페이지의 모든 블록을 재귀적으로 가져오기
 *
 * Notion의 블록 구조는 중첩될 수 있음 (예: toggle, column 등)
 *
 * @param blockId - 블록 또는 페이지 ID
 * @returns 모든 블록 배열
 */
async function getAllBlocks(blockId: string): Promise<NotionBlock[]> {
  const notion = getNotionClient();
  const allBlocks: NotionBlock[] = [];

  try {
    // 블록 리스트 가져오기
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
    });

    for (const block of response.results) {
      // Notion API 응답을 NotionBlock 타입으로 캐스팅
      const notionBlock = block as NotionBlock;
      allBlocks.push(notionBlock);

      // 자식 블록이 있으면 재귀적으로 가져오기
      if ('has_children' in block && block.has_children) {
        const childBlocks = await getAllBlocks(block.id);
        allBlocks.push(...childBlocks);
      }
    }

    return allBlocks;
  } catch (error) {
    console.error(`[Notion] Failed to get blocks for ${blockId}:`, error);
    return [];
  }
}

/**
 * 페이지의 모든 이미지를 추출하고 Cloudinary로 업로드
 *
 * @param pageId - Notion 페이지 ID
 * @returns 이미지 정보 배열
 */
export async function extractAndUploadImages(
  pageId: string
): Promise<ImageInfo[]> {
  console.log(`[Images] Extracting images from page ${pageId}`);

  // Cloudinary가 설정되어 있지 않으면 빈 배열 반환 (업로드 시도하지 않음)
  if (!isCloudinaryConfigured()) {
    console.log('[Images] Cloudinary not configured - skipping image upload');
    return [];
  }

  try {
    // 모든 블록 가져오기
    const blocks = await getAllBlocks(pageId);

    // 이미지 블록만 필터링
    const imageBlocks = blocks.filter((block) => block.type === 'image');

    if (imageBlocks.length === 0) {
      console.log('[Images] No images found in page');
      return [];
    }

    console.log(`[Images] Found ${imageBlocks.length} images`);

    // 각 이미지를 Cloudinary로 업로드
    const imageInfos: ImageInfo[] = [];

    for (const block of imageBlocks) {
      const notionUrl = extractImageUrl(block);

      if (!notionUrl) {
        // extractImageUrl에서 이미 유효성 검증 완료 (로그도 출력됨)
        continue;
      }

      try {
        // Cloudinary 업로드
        const cloudinaryUrl = await uploadNotionImage(
          notionUrl,
          pageId,
          block.id
        );

        imageInfos.push({
          blockId: block.id,
          notionUrl,
          cloudinaryUrl,
        });
      } catch (error) {
        console.error(
          `[Images] Failed to process image ${block.id}:`,
          error
        );
        // 에러가 발생해도 다른 이미지는 계속 처리
      }
    }

    console.log(`[Images] Successfully processed ${imageInfos.length}/${imageBlocks.length} images`);

    return imageInfos;
  } catch (error) {
    console.error(`[Images] Failed to extract images from page ${pageId}:`, error);
    return [];
  }
}

/**
 * 이미지 URL 매핑 생성
 *
 * Notion URL → Cloudinary URL 변환을 위한 맵 생성
 * Notion URL은 signature가 포함되어 있으므로 정규화해서 매칭
 *
 * @param imageInfos - 이미지 정보 배열
 * @returns URL 매핑 객체
 */
export function createImageMapping(imageInfos: ImageInfo[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const info of imageInfos) {
    // Query string을 제거한 URL을 키로 사용
    const normalizedUrl = info.notionUrl.split('?')[0];
    mapping[normalizedUrl] = info.cloudinaryUrl;
  }

  return mapping;
}

/**
 * 마크다운 콘텐츠의 이미지 URL 교체
 *
 * Notion URL을 Cloudinary URL로 교체
 *
 * @param markdown - 원본 마크다운
 * @param imageMapping - URL 매핑
 * @returns 교체된 마크다운
 */
export function replaceImageUrls(
  markdown: string,
  imageMapping: Record<string, string>
): string {
  let result = markdown;

  for (const [normalizedUrl, cloudinaryUrl] of Object.entries(imageMapping)) {
    // Notion URL은 query string이 포함될 수 있으므로
    // 정규식으로 query string이 있든 없든 매칭
    const escapedUrl = normalizedUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedUrl}(\\?[^)\\s]*)?`, 'g');

    result = result.replace(regex, cloudinaryUrl);
  }

  return result;
}
