import { ok, fail, getToken } from '../../../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  if (!token) return fail('인증이 필요합니다.', 401);

  const imageNumber = Date.now();
  const idx = imageNumber % 100;
  const url = `https://placehold.co/400x300/8B9CF7/ffffff?text=image${idx}`;
  return ok({ imageNumber, url });
}
