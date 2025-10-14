/**
 * Cloudinary 설정 및 클라이언트
 */

import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary 클라이언트 초기화
 */
function initCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary credentials not found. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Cloudinary 클라이언트 가져오기
 */
export function getCloudinaryClient() {
  return initCloudinary();
}

/**
 * Cloudinary 자격증명이 설정되어 있는지 확인
 */
export function isCloudinaryConfigured(): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  return !!(cloudName && apiKey && apiSecret);
}

/**
 * Cloudinary Cloud Name 가져오기
 */
export function getCloudName(): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME not configured');
  }
  return cloudName;
}
