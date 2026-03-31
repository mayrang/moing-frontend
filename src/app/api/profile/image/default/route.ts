import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

const DEFAULT_IMAGES = [
  'https://placehold.co/100x100/8B9CF7/ffffff?text=1',
  'https://placehold.co/100x100/F7A48B/ffffff?text=2',
  'https://placehold.co/100x100/8BF7C4/ffffff?text=3',
  'https://placehold.co/100x100/F7E48B/ffffff?text=4',
];

export async function PUT(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { defaultNumber } = await request.json();
  const url = DEFAULT_IMAGES[(defaultNumber - 1) % DEFAULT_IMAGES.length] ?? DEFAULT_IMAGES[0];
  user.profileImageUrl = url;
  return ok({ profileImageUrl: url });
}
