import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function PUT(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { name, ageGroup, gender, introduction, preferredTags, newPassword } = await request.json();
  Object.assign(user, {
    name: name ?? user.name,
    ageGroup: ageGroup ?? user.ageGroup,
    gender: gender ?? user.gender,
    introduction: introduction ?? user.introduction,
    preferredTags: preferredTags ?? user.preferredTags,
    password: newPassword ?? user.password,
  });
  return ok(null);
}
