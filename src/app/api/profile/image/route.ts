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

  const url = `https://placehold.co/100x100/8B9CF7/ffffff?text=${encodeURIComponent(user.name[0] || 'U')}`;
  user.profileImageUrl = url;
  return ok({ profileImageUrl: url });
}

export async function PUT(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const body = await request.json().catch(() => ({}));
  if (body.imageUrl) {
    user.profileImageUrl = body.imageUrl;
  } else {
    const url = `https://placehold.co/100x100/8B9CF7/ffffff?text=${encodeURIComponent(user.name[0] || 'U')}`;
    user.profileImageUrl = url;
  }
  return ok({ profileImageUrl: user.profileImageUrl });
}

export async function DELETE(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  user.profileImageUrl = null;
  return ok({ message: '프로필 이미지가 삭제되었습니다.' });
}
