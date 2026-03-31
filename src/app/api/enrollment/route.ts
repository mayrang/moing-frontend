import db, { Enrollment } from '@/mocks/db/store';
import { ok, fail, getToken } from '../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { travelNumber } = await request.json();
  const trip = db.trips.get(travelNumber);
  if (!trip) return fail('존재하지 않는 여행입니다.', 404);
  if (trip.userNumber === user.userNumber) return fail('본인 여행에는 신청할 수 없습니다.', 400);

  const existing = [...db.enrollments.values()].find(
    (e) => e.travelNumber === travelNumber && e.userNumber === user.userNumber,
  );
  if (existing) return fail('이미 신청한 여행입니다.', 400);

  const enrollmentNumber = db.nextEnrollmentId();
  const enrollment: Enrollment = {
    enrollmentNumber,
    travelNumber,
    userNumber: user.userNumber,
    status: 'PENDING',
    createdAt: db.now(),
  };
  db.enrollments.set(enrollmentNumber, enrollment);
  return ok({ enrollmentNumber });
}
