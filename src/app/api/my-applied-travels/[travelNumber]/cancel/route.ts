import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { travelNumber } = await params;
  const enrollment = [...db.enrollments.values()].find(
    (e) => e.travelNumber === parseInt(travelNumber) && e.userNumber === user.userNumber,
  );
  if (!enrollment) return fail('신청 내역을 찾을 수 없습니다.', 404);

  db.enrollments.delete(enrollment.enrollmentNumber);
  return ok(null);
}
