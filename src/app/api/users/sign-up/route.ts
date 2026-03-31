import db, { User } from '@/mocks/db/store';
import { ok, fail } from '../../_lib/helpers';

export async function POST(request: Request) {
  const { email, password, name, ageGroup, gender, preferredTags, sessionToken } = await request.json();

  const verification = db.emailVerifications.get(sessionToken);
  if (!verification || verification.email !== email) {
    return fail('이메일 인증이 완료되지 않았습니다.');
  }
  if (db.getUserByEmail(email)) return fail('이미 사용중인 이메일입니다.');

  const userNumber = db.nextUserId();
  const user: User = {
    userNumber,
    email,
    password,
    name: name || '',
    ageGroup: ageGroup || '20대',
    gender: gender || '',
    preferredTags: preferredTags || [],
    introduction: '',
    profileImageUrl: null,
    status: 'ABLE',
    socialLogin: null,
    socialLoginId: null,
    createdAt: db.now(),
  };
  db.users.set(userNumber, user);
  db.emailVerifications.delete(sessionToken);

  const { accessToken, refreshToken } = db.createSession(userNumber);
  const response = ok({ userNumber, email, accessToken });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
