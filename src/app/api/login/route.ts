import db, { User } from '@/mocks/db/store';
import { ok, fail } from '../_lib/helpers';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  let user = db.getUserByEmail(email);

  // 데모 모드: 유저 없으면 자동 생성, 비번 검사 생략
  if (!user) {
    const userNumber = db.nextUserId();
    user = {
      userNumber,
      email,
      password,
      name: email.split('@')[0],
      ageGroup: '20대',
      gender: '',
      preferredTags: [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: null,
      socialLoginId: null,
      createdAt: db.now(),
    };
    db.users.set(userNumber, user);
  }
  if (user.status === 'BLOCK') {
    return fail('계정이 차단되었습니다.', 403);
  }

  const { accessToken, refreshToken } = db.createSession(user.userNumber);
  const response = ok({ userNumber: user.userNumber, accessToken });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
