import db from '@/mocks/db/store';
import { ok } from '../_lib/helpers';

export async function GET(request: Request) {
  const keyword = new URL(request.url).searchParams.get('keyword') ?? '';
  const suggestions = [...db.trips.values()]
    .filter((t) => t.status === 'IN_PROGRESS' && t.title.includes(keyword))
    .slice(0, 5)
    .map((t) => t.title);
  return ok(suggestions);
}
