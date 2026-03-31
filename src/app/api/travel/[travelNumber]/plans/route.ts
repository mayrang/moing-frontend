import { ok } from '../../../_lib/helpers';

export async function GET() {
  return ok({ plans: [], nextCursor: null });
}
