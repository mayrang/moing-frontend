import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../_lib/helpers';

export async function GET(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const notifications = [...db.notifications.values()]
    .filter((n) => n.userNumber === user.userNumber)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return ok({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length });
}
