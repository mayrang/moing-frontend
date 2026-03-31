import db from '@/mocks/db/store';
import { ok, fail } from '../../../_lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const { travelNumber } = await params;
  const trip = db.trips.get(parseInt(travelNumber));
  if (!trip) return fail('존재하지 않는 여행입니다.', 404);

  const companions = db
    .getEnrollmentsByTravel(parseInt(travelNumber))
    .filter((e) => e.status === 'ACCEPTED')
    .map((e) => {
      const u = db.users.get(e.userNumber);
      return { userNumber: e.userNumber, userName: u?.name || '', profileImageUrl: u?.profileImageUrl || null };
    });

  return ok({ companions });
}
