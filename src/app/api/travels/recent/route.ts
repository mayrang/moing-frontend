import db from '@/mocks/db/store';
import { ok, getToken } from '../../_lib/helpers';
import { formatTrip } from '../../_lib/formatTrip';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;

  const active = [...db.trips.values()]
    .filter((t) => t.status === 'IN_PROGRESS')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = active.slice(page * size, (page + 1) * size);
  return ok({
    content: paginated.map((t) => formatTrip(t, user?.userNumber)),
    page: {
      size,
      number: page,
      totalElements: active.length,
      totalPages: Math.ceil(active.length / size),
    },
  });
}
