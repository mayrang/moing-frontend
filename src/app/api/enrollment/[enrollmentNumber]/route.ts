import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ enrollmentNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { enrollmentNumber } = await params;
  const enrollment = db.enrollments.get(parseInt(enrollmentNumber));
  if (!enrollment) return fail('존재하지 않는 신청입니다.', 404);
  if (enrollment.userNumber !== user.userNumber) return fail('권한이 없습니다.', 403);

  db.enrollments.delete(parseInt(enrollmentNumber));
  return ok(null);
}
