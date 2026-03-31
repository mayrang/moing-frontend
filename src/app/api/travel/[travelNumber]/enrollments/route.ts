import db from '@/mocks/db/store';
import { ok } from '../../../_lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const { travelNumber } = await params;
  const enrollments = db
    .getEnrollmentsByTravel(parseInt(travelNumber))
    .filter((e) => e.status === 'PENDING')
    .map((e) => {
      const u = db.users.get(e.userNumber);
      return {
        enrollmentNumber: e.enrollmentNumber,
        userName: u?.name || '',
        userAgeGroup: u?.ageGroup || '',
        enrolledAt: e.createdAt,
        message: '',
        status: e.status,
        profileUrl: u?.profileImageUrl || null,
      };
    });
  return ok({ enrollments, totalCount: enrollments.length });
}
