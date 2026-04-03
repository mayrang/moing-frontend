import db, { User } from '@/mocks/db/store';
import { ok } from '../../../_lib/helpers';

export async function PUT(request: Request) {
  const { userNumber, name, ageGroup, gender, preferredTags, email } = await request.json();
  const user = db.users.get(userNumber);

  if (!user) {
    const newUser: User = {
      userNumber,
      email: email || 'google@test.com',
      password: '',
      name,
      ageGroup,
      gender,
      preferredTags: preferredTags || [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'google',
      socialLoginId: 'google-social-id',
      createdAt: db.now(),
      travelDistance: 0,
      travelBadgeCount: 0,
      visitedCountryCount: 0,
      userSocialTF: true,
    };
    db.users.set(userNumber, newUser);
  } else {
    Object.assign(user, { name, ageGroup, gender, preferredTags });
  }

  const { accessToken, refreshToken } = db.createSession(userNumber);
  const response = ok({ userNumber, accessToken });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
