import db, { Bookmark } from '@/mocks/db/store';
import { ok, fail, getToken } from '../_lib/helpers';
import { formatTrip } from '../_lib/formatTrip';

export async function GET(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');

  const bookmarks = [...db.bookmarks.values()].filter((b) => b.userNumber === user.userNumber);
  const trips = bookmarks
    .map((b) => db.trips.get(b.travelNumber))
    .filter((t): t is NonNullable<typeof t> => !!t && t.status !== 'DELETED');

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

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { travelNumber } = await request.json();
  const key = db.getBookmarkKey(user.userNumber, travelNumber);
  if (db.bookmarks.has(key)) return ok(null);

  const bookmark: Bookmark = {
    userNumber: user.userNumber,
    travelNumber,
    createdAt: db.now(),
  };
  db.bookmarks.set(key, bookmark);
  return ok(null);
}
