import db from '@/mocks/db/store';
import { ok } from '../../../_lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const { travelNumber } = await params;
  const count = db
    .getEnrollmentsByTravel(parseInt(travelNumber))
    .filter((e) => e.status === 'PENDING').length;
  return ok({ count });
}
