import db from '@/mocks/db/store';
import { ok } from '../_lib/helpers';

export async function GET(request: Request) {
  const keyword = new URL(request.url).searchParams.get('location') ?? '';
  const suggestions = [...new Set(
    [...db.trips.values()]
      .filter((t) => t.locationName.includes(keyword))
      .map((t) => t.locationName)
  )].slice(0, 5);
  return ok({ suggestions });
}
