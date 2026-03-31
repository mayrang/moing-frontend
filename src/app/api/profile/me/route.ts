import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function GET(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  return ok({
    userNumber: user.userNumber,
    email: user.email,
    name: user.name,
    ageGroup: user.ageGroup,
    gender: user.gender,
    introduction: user.introduction,
    profileImageUrl: user.profileImageUrl,
    preferredTags: user.preferredTags,
  });
}

export async function PUT(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { name, ageGroup, gender, introduction, preferredTags } = await request.json();
  Object.assign(user, {
    name: name ?? user.name,
    ageGroup: ageGroup ?? user.ageGroup,
    gender: gender ?? user.gender,
    introduction: introduction ?? user.introduction,
    preferredTags: preferredTags ?? user.preferredTags,
  });
  return ok(null);
}
