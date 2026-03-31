import db from '@/mocks/db/store';
import { ok, fail } from '../../../_lib/helpers';
import { formatTrip } from '../../../_lib/formatTrip';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userNumber: string }> },
) {
  const { userNumber } = await params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');

  const user = db.users.get(parseInt(userNumber));
  if (!user) return fail('사용자를 찾을 수 없습니다.', 404);

  const trips = [...db.trips.values()]
    .filter((t) => t.userNumber === parseInt(userNumber) && t.status !== 'DELETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = trips.slice(page * size, (page + 1) * size);
  return ok({
    content: paginated.map((t) => formatTrip(t)),
    page: {
      size,
      number: page,
      totalElements: trips.length,
      totalPages: Math.ceil(trips.length / size),
    },
  });
}
