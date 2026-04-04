import db, { User } from '@/mocks/db/store';
import { ok } from '../../../../_lib/helpers';

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  if (code === 'pending-code') {
    return ok({
      userStatus: 'PENDING',
      userNumber: 200,
      userName: '카카오유저',
      socialLoginId: 'kakao-social-id',
      userEmail: '',
    });
  }

  let user = [...db.users.values()].find((u) => u.socialLoginId === 'kakao-social-id');
  if (!user) {
    const userNumber = db.nextUserId();
    user = {
      userNumber,
      email: 'kakao@test.com',
      password: '',
      name: '카카오유저',
      ageGroup: '20대',
      gender: '',
      preferredTags: [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'kakao',
      socialLoginId: 'kakao-social-id',
      createdAt: db.now(),
      travelDistance: 0,
      travelBadgeCount: 0,
      visitedCountryCount: 0,
      userSocialTF: true,
    };
    db.users.set(userNumber, user);
  }
  return ok({ userStatus: 'ABLE', socialLoginId: 'kakao-social-id', userEmail: 'kakao@test.com' });
}
