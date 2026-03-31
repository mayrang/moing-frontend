import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  // 데모: 비밀번호 검사 생략, 항상 통과
  return ok({ verified: true });
}
