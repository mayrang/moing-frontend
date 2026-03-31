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
  // 내가 만든 여행의 신청 중 해당 여행번호에 해당하는 것 취소
  const trip = db.trips.get(parseInt(travelNumber));
  if (!trip || trip.userNumber !== user.userNumber) return fail('권한이 없습니다.', 403);

  const enrollments = db
    .getEnrollmentsByTravel(parseInt(travelNumber))
    .filter((e) => e.status === 'PENDING');
  enrollments.forEach((e) => db.enrollments.delete(e.enrollmentNumber));
  return ok(null);
}
