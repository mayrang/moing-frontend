import db from '@/mocks/db/store';
import { ok, fail } from '../../_lib/helpers';

export async function POST(request: Request) {
  const { socialLoginId, email } = await request.json();
  const user = [...db.users.values()].find(
    (u) => u.socialLoginId === socialLoginId || u.email === email,
  );
  if (!user) return fail('소셜 로그인 정보를 찾을 수 없습니다.', 401);

  const { accessToken, refreshToken } = db.createSession(user.userNumber);
  const response = ok({ userId: user.userNumber, accessToken });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
