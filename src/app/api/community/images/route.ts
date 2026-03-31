import { ok, fail, getToken } from '../../_lib/helpers';

// 단순화된 이미지 업로드: 실제 파일 저장 없이 placehold URL 반환
export async function POST(request: Request) {
  const token = getToken(request);
  if (!token) return fail('인증이 필요합니다.', 401);

  const imageNumber = Date.now();
  const idx = imageNumber % 100;
  const url = `https://placehold.co/400x300/8B9CF7/ffffff?text=image${idx}`;
  return ok({ imageNumber, url });
}
