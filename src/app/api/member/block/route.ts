import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  // 데모: 신고 접수만 ok 반환
  return ok({ message: '신고가 접수되었습니다.' });
}
