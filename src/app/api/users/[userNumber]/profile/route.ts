import db from '@/mocks/db/store';
import { ok, fail } from '../../../_lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userNumber: string }> },
) {
  const { userNumber } = await params;
  const user = db.users.get(parseInt(userNumber));
  if (!user) return fail('사용자를 찾을 수 없습니다.', 404);

  return ok({
    userNumber: user.userNumber,
    name: user.name,
    ageGroup: user.ageGroup,
    gender: user.gender,
    introduction: user.introduction,
    profileImageUrl: user.profileImageUrl,
    preferredTags: user.preferredTags,
  });
}
