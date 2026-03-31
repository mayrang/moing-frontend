import { cookies } from 'next/headers';
import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function DELETE(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  db.blockedEmails.add(user.email);
  db.users.delete(user.userNumber);
  if (token) db.sessions.delete(token);

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (refreshToken) db.refreshTokens.delete(refreshToken);

  const response = ok(true);
  response.cookies.delete('refreshToken');
  return response;
}
