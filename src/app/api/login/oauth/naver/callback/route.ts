import db, { User } from '@/mocks/db/store';
import { ok } from '../../../../_lib/helpers';

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  if (code === 'pending-code') {
    return ok({ userStatus: 'PENDING', userNumber: 300 });
  }

  let user = [...db.users.values()].find((u) => u.socialLoginId === 'naver-social-id');
  if (!user) {
    const userNumber = db.nextUserId();
    user = {
      userNumber,
      email: 'naver@test.com',
      password: '',
      name: '네이버유저',
      ageGroup: '20대',
      gender: '',
      preferredTags: [],
      introduction: '',
      profileImageUrl: null,
      status: 'ABLE',
      socialLogin: 'naver',
      socialLoginId: 'naver-social-id',
      createdAt: db.now(),
    } as User;
    db.users.set(userNumber, user);
  }
  return ok({ userStatus: 'ABLE', socialLoginId: 'naver-social-id', userEmail: 'naver@test.com' });
}
