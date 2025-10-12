/**
 * Notion API 클라이언트
 */

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { blogConfig } from '@/blog.config';

/**
 * Notion 클라이언트 싱글톤
 */
let notionClient: Client | null = null;
let n2mClient: NotionToMarkdown | null = null;

/**
 * Notion 클라이언트 가져오기 (lazy initialization)
 */
export function getNotionClient(): Client {
  if (!notionClient) {
    const apiKey = blogConfig.notion.apiKey;

    if (!apiKey) {
      throw new Error(
        'NOTION_API_KEY is not configured. Please check your .env.local file.'
      );
    }

    notionClient = new Client({
      auth: apiKey,
    });
  }

  return notionClient;
}

/**
 * Notion to Markdown 클라이언트 가져오기
 */
export function getN2MClient(): NotionToMarkdown {
  if (!n2mClient) {
    const client = getNotionClient();
    n2mClient = new NotionToMarkdown({ notionClient: client });
  }

  return n2mClient;
}

/**
 * 데이터베이스 ID 가져오기
 */
export function getDatabaseId(): string {
  const databaseId = blogConfig.notion.databaseId;

  if (!databaseId) {
    throw new Error(
      'NOTION_DATABASE_ID is not configured. Please check your .env.local file.'
    );
  }

  return databaseId;
}

/**
 * Data Source ID 캐시
 */
let cachedDataSourceId: string | null = null;

/**
 * Data Source ID 가져오기 (캐싱)
 * v5 API (2025-09-03)에서는 databases.query 대신 dataSources.query를 사용해야 함
 */
export async function getDataSourceId(): Promise<string> {
  // 이미 캐시된 경우 바로 반환
  if (cachedDataSourceId) {
    return cachedDataSourceId;
  }

  const client = getNotionClient();
  const databaseId = getDatabaseId();

  try {
    const database = await client.databases.retrieve({
      database_id: databaseId,
    });

    // v5 API: database.data_sources 배열에서 첫 번째 data source 사용
    // 타입 정의가 완전하지 않아 타입 단언 사용
    const databaseWithSources = database as typeof database & {
      data_sources?: Array<{ id: string; name: string }>;
    };

    if (!databaseWithSources.data_sources || databaseWithSources.data_sources.length === 0) {
      throw new Error(
        'This database does not have any data sources. Please check your Notion database setup.'
      );
    }

    // 첫 번째 data source 사용 (대부분의 경우 하나만 존재)
    cachedDataSourceId = databaseWithSources.data_sources[0].id;
    console.log(`Using data source: ${databaseWithSources.data_sources[0].name} (ID: ${cachedDataSourceId})`);

    return cachedDataSourceId;
  } catch (error) {
    console.error('Error retrieving data source ID:', error);
    throw new Error('Failed to retrieve Notion data source ID');
  }
}
