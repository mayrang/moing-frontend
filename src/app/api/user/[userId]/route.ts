import db from '@/mocks/db/store';
import { ok, fail } from '../../_lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const user = db.users.get(parseInt(userId));
  if (!user) return fail('사용자를 찾을 수 없습니다.', 404);

  return ok({
    userNumber: user.userNumber,
    name: user.name,
    profileImageUrl: user.profileImageUrl,
  });
}
