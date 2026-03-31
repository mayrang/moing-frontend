import db from '@/mocks/db/store';
import { ok, fail } from '../../_lib/helpers';

export async function POST(request: Request) {
  const { verifyCode, sessionToken } = await request.json();

  const verification = db.emailVerifications.get(sessionToken);
  if (!verification) return fail('유효하지 않은 세션입니다.');

  // 데모 모드: 코드 일치 여부 / 만료 검사 생략 → 아무 코드나 통과
  return ok({});
}
