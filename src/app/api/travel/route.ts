import db, { Trip } from '@/mocks/db/store';
import { ok, fail, getToken } from '../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { title, details, locationName, startDate, endDate, maxPerson, genderType, periodType, tags } =
    await request.json();
  const travelNumber = db.nextTripId();
  const trip: Trip = {
    travelNumber,
    userNumber: user.userNumber,
    title,
    details: details || '',
    locationName: locationName || '',
    startDate,
    endDate,
    maxPerson: maxPerson || 2,
    genderType: genderType || 'ANY',
    periodType: periodType || 'SHORT',
    status: 'IN_PROGRESS',
    tags: tags || [],
    viewCount: 0,
    createdAt: db.now(),
  };
  db.trips.set(travelNumber, trip);
  return ok({ travelNumber });
}
