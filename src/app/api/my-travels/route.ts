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

  const trips = [...db.trips.values()]
    .filter((t) => t.userNumber === user.userNumber && t.status !== 'DELETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = trips.slice(page * size, (page + 1) * size);
  return ok({
    content: paginated.map((t) => formatTrip(t, user.userNumber)),
    page: {
      size,
      number: page,
      totalElements: trips.length,
      totalPages: Math.ceil(trips.length / size),
    },
  });
}
