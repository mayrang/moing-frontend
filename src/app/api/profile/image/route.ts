import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function GET(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);
  return ok({ profileImageUrl: user.profileImageUrl });
}

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  // 실제 파일 저장 없이 placehold URL 반환
  const url = `https://placehold.co/100x100/8B9CF7/ffffff?text=${encodeURIComponent(user.name[0] || 'U')}`;
  user.profileImageUrl = url;
  return ok({ profileImageUrl: url });
}
