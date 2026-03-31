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

  const enrollments = [...db.enrollments.values()].filter(
    (e) => e.userNumber === parseInt(userNumber) && e.status === 'ACCEPTED',
  );
  const trips = enrollments
    .map((e) => db.trips.get(e.travelNumber))
    .filter((t): t is NonNullable<typeof t> => !!t && t.status !== 'DELETED');

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
