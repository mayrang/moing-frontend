import db from '@/mocks/db/store';
import { ok } from '../../_lib/helpers';

// E2E 테스트용 DB 초기화 엔드포인트
export async function POST() {
  db.reset();
  return ok({ reset: true });
}
