import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { travelNumber } = await params;
  const key = db.getBookmarkKey(user.userNumber, parseInt(travelNumber));
  db.bookmarks.delete(key);
  return ok(null);
}
