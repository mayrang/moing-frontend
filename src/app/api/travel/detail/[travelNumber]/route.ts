import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';
import { formatTrip } from '../../../_lib/formatTrip';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const { travelNumber } = await params;
  const trip = db.trips.get(parseInt(travelNumber));
  if (!trip || trip.status === 'DELETED') return fail('존재하지 않는 여행입니다.', 404);

  trip.viewCount += 1;
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  return ok(formatTrip(trip, user?.userNumber));
}
