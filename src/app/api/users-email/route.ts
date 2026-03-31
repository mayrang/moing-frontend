import db from '@/mocks/db/store';
import { ok, fail } from '../_lib/helpers';

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get('email');
  if (!email) return fail('이메일을 입력해주세요.');

  if (db.blockedEmails.has(email)) return ok(false);
  return ok(!db.getUserByEmail(email));
}
