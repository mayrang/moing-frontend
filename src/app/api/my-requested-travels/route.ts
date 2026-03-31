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

  // 내가 만든 여행에 들어온 신청 목록
  const myTrips = [...db.trips.values()].filter(
    (t) => t.userNumber === user.userNumber && t.status !== 'DELETED',
  );
  const requests = myTrips
    .flatMap((trip) =>
      db
        .getEnrollmentsByTravel(trip.travelNumber)
        .filter((e) => e.status === 'PENDING')
        .map((e) => {
          const applicant = db.users.get(e.userNumber);
          return {
            ...formatTrip(trip, user.userNumber),
            enrollmentNumber: e.enrollmentNumber,
            applicantName: applicant?.name || '',
            applicantProfileUrl: applicant?.profileImageUrl || null,
          };
        }),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = requests.slice(page * size, (page + 1) * size);
  return ok({
    content: paginated,
    page: {
      size,
      number: page,
      totalElements: requests.length,
      totalPages: Math.ceil(requests.length / size),
    },
  });
}
