import db from '@/mocks/db/store';
import { ok, getToken } from '../../_lib/helpers';
import { formatTrip } from '../../_lib/formatTrip';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') ?? '';
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;

  const results = [...db.trips.values()].filter(
    (t) =>
      t.status === 'IN_PROGRESS' &&
      (t.title.includes(keyword) ||
        t.locationName.includes(keyword) ||
        t.tags.some((tag) => tag.includes(keyword))),
  );

  const paginated = results.slice(page * size, (page + 1) * size);
  return ok({
    content: paginated.map((t) => formatTrip(t, user?.userNumber)),
    page: {
      size,
      number: page,
      totalElements: results.length,
      totalPages: Math.ceil(results.length / size),
    },
  });
}
