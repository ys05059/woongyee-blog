/**
 * Config Loader
 * blog.config.ts를 불러와서 사용
 */

import { blogConfig } from '@/blog.config';

export { blogConfig };

/**
 * 환경변수 검증
 */
export function validateEnv() {
  const required = ['NOTION_API_KEY', 'NOTION_DATABASE_ID'];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file.'
    );
  }
}

/**
 * Notion 설정이 유효한지 확인
 */
export function isNotionConfigured(): boolean {
  return !!(blogConfig.notion.apiKey && blogConfig.notion.databaseId);
}
