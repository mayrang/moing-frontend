import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../_lib/helpers';
import { formatTrip } from '../_lib/formatTrip';

export async function GET(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');

  const enrollments = [...db.enrollments.values()].filter((e) => e.userNumber === user.userNumber);
  const trips = enrollments
    .map((e) => {
      const trip = db.trips.get(e.travelNumber);
      return trip && trip.status !== 'DELETED' ? { trip, enrollment: e } : null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const paginated = trips.slice(page * size, (page + 1) * size);
  return ok({
    content: paginated.map(({ trip, enrollment }) => ({
      ...formatTrip(trip, user.userNumber),
      enrollmentNumber: enrollment.enrollmentNumber,
      enrollmentStatus: enrollment.status,
    })),
    page: {
      size,
      number: page,
      totalElements: trips.length,
      totalPages: Math.ceil(trips.length / size),
    },
  });
}
