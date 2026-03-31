import { ok } from '../../_lib/helpers';

export async function POST() {
  // 데모: 문의 접수만 ok 반환 (실제 이메일 전송 없음)
  return ok({ message: '문의가 접수되었습니다.' });
}
