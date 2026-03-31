import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  // 데모: 실제 파일 저장 없이 placehold URL 반환
  const tempUrl = `https://placehold.co/100x100/8B9CF7/ffffff?text=${encodeURIComponent(user.name[0] || 'U')}&t=${Date.now()}`;
  return ok({ imageUrl: tempUrl });
}

export async function DELETE(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  return ok({ message: '임시 이미지가 삭제되었습니다.' });
}
