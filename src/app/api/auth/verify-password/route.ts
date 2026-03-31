import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { password } = await request.json();
  if (user.password !== password) return fail('비밀번호가 올바르지 않습니다.', 401);
  return ok(true);
}
