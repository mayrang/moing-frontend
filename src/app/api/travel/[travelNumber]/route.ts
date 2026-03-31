import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { travelNumber } = await params;
  const trip = db.trips.get(parseInt(travelNumber));
  if (!trip) return fail('존재하지 않는 여행입니다.', 404);
  if (trip.userNumber !== user.userNumber) return fail('권한이 없습니다.', 403);

  const body = await request.json();
  Object.assign(trip, {
    title: body.title ?? trip.title,
    details: body.details ?? trip.details,
    locationName: body.locationName ?? trip.locationName,
    startDate: body.startDate ?? trip.startDate,
    endDate: body.endDate ?? trip.endDate,
    maxPerson: body.maxPerson ?? trip.maxPerson,
    genderType: body.genderType ?? trip.genderType,
    periodType: body.periodType ?? trip.periodType,
    tags: body.tags ?? trip.tags,
  });
  return ok({ travelNumber: trip.travelNumber });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ travelNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { travelNumber } = await params;
  const trip = db.trips.get(parseInt(travelNumber));
  if (!trip) return fail('존재하지 않는 여행입니다.', 404);
  if (trip.userNumber !== user.userNumber) return fail('권한이 없습니다.', 403);

  trip.status = 'DELETED';
  return ok(true);
}
