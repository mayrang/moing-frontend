import db, { User } from '@/mocks/db/store';
import { ok } from '../../../../_lib/helpers';

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  if (code === 'pending-code') {
    return ok({
      userStatus: 'PENDING',
      userNumber: 100,
      userName: '구글유저',
      socialLoginId: 'google-social-id',
      userEmail: 'google@test.com',
    });
  }

  let user = [...db.users.values()].find((u) => u.socialLoginId === 'google-social-id');
  if (!user) {
    const userNumber = db.nextUserId();
    user = {
      userNumber,
      email: 'google@test.com',
      password: '',
      name: '구글유저',
      ageGroup: '20대',
      gender: '',
      preferredTags: [],
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
    db.users.set(userNumber, user);
  }
  return ok({ userStatus: 'ABLE', socialLoginId: 'google-social-id', userEmail: 'google@test.com' });
}
