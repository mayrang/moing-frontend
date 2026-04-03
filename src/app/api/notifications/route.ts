import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../_lib/helpers';

export async function GET(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '10');

  const all = [...db.notifications.values()]
    .filter((n) => n.userNumber === user.userNumber)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const content = all.slice(page * size, (page + 1) * size);

  return ok({
    content,
    page: {
      size,
      number: page,
      totalElements: all.length,
      totalPages: Math.ceil(all.length / size) || 1,
    },
    unreadCount: all.filter((n) => !n.isRead).length,
  });
}
