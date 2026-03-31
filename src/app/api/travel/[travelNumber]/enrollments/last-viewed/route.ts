import { ok } from '../../../../_lib/helpers';

export async function GET() {
  return ok({ lastViewedAt: null });
}

export async function PUT() {
  return ok(true);
}
