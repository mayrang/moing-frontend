import { cookies } from 'next/headers';
import db from '@/mocks/db/store';
import { ok, fail } from '../../_lib/helpers';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) return fail('리프레시 토큰이 없습니다.', 401);

  const userNumber = db.refreshTokens.get(refreshToken);
  if (!userNumber) return fail('유효하지 않은 리프레시 토큰입니다.', 401);

  const user = db.users.get(userNumber);
  if (!user) return fail('사용자를 찾을 수 없습니다.', 401);

  db.refreshTokens.delete(refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = db.createSession(userNumber);

  const response = ok({ userNumber, accessToken });
  response.cookies.set('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
