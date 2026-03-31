import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function PUT(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { newPassword } = await request.json();
  user.password = newPassword;
  return ok({ message: '비밀번호가 변경되었습니다.' });
}
