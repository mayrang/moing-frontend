import db from '@/mocks/db/store';
import { ok, fail } from '../../../_lib/helpers';

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return fail('이메일을 입력해주세요.');

  const sessionToken = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  // 데모 모드: 항상 111111 고정 (아무 코드나 입력해도 통과)
  const verifyCode = '111111';

  db.emailVerifications.set(sessionToken, {
    email,
    sessionToken,
    verifyCode,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  console.log(`[Mock] 이메일 인증 코드 - ${email}: ${verifyCode}`);
  return ok({ sessionToken });
}
