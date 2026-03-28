import { Router, Request, Response } from 'express';
import db, { Trip } from '../db/store';

const router = Router();

const ok = (res: Response, success: unknown) =>
  res.json({ resultType: 'SUCCESS', success, error: null });

const fail = (res: Response, reason: string, status = 400) =>
  res.status(status).json({ resultType: 'FAIL', success: null, error: { reason } });

const getBearerToken = (req: Request) => {
  const auth = req.headers.authorization;
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
};

const formatTrip = (trip: Trip, userNumber?: number) => {
  const host = db.users.get(trip.userNumber);
  const companions = db.getEnrollmentsByTravel(trip.travelNumber)
    .filter((e) => e.status === 'ACCEPTED')
    .map((e) => {
      const u = db.users.get(e.userNumber);
      return { userNumber: e.userNumber, name: u?.name || '', profileImageUrl: u?.profileImageUrl || null };
    });

  return {
    travelNumber: trip.travelNumber,
    userNumber: trip.userNumber,
    hostName: host?.name || '',
    hostAgeGroup: host?.ageGroup || '',
    title: trip.title,
    details: trip.details,
    locationName: trip.locationName,
    startDate: trip.startDate,
    endDate: trip.endDate,
    maxPerson: trip.maxPerson,
    currentPerson: companions.length + 1,
    genderType: trip.genderType,
    periodType: trip.periodType,
    status: trip.status,
    tags: trip.tags,
    viewCount: trip.viewCount,
    createdAt: trip.createdAt,
    isBookmarked: userNumber
      ? db.bookmarks.has(db.getBookmarkKey(userNumber, trip.travelNumber))
      : false,
  };
};

// ── 여행 생성 ─────────────────────────────────────────────────────────────
// POST /api/travel
router.post('/travel', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const { title, details, locationName, startDate, endDate, maxPerson, genderType, periodType, tags } = req.body;
  const travelNumber = db.nextTripId();
  const trip: Trip = {
    travelNumber,
    userNumber: user.userNumber,
    title,
    details: details || '',
    locationName: locationName || '',
    startDate,
    endDate,
    maxPerson: maxPerson || 2,
    genderType: genderType || 'ANY',
    periodType: periodType || 'SHORT',
    status: 'IN_PROGRESS',
    tags: tags || [],
    viewCount: 0,
    createdAt: db.now(),
  };
  db.trips.set(travelNumber, trip);
  return ok(res, { travelNumber });
});

// ── 여행 상세 조회 ────────────────────────────────────────────────────────
// GET /api/travel/detail/:travelNumber
router.get('/travel/detail/:travelNumber', (req: Request, res: Response) => {
  const travelNumber = parseInt(req.params.travelNumber);
  const trip = db.trips.get(travelNumber);
  if (!trip || trip.status === 'DELETED') return fail(res, '존재하지 않는 여행입니다.', 404);

  trip.viewCount += 1;

  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;
  return ok(res, formatTrip(trip, user?.userNumber));
});

// ── 최근 여행 목록 ────────────────────────────────────────────────────────
// GET /api/travels/recent
router.get('/travels/recent', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 5;
  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;

  const active = [...db.trips.values()]
    .filter((t) => t.status === 'IN_PROGRESS')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = active.slice(page * size, (page + 1) * size);
  return ok(res, {
    content: paginated.map((t) => formatTrip(t, user?.userNumber)),
    totalElements: active.length,
    totalPages: Math.ceil(active.length / size),
    number: page,
    size,
    last: (page + 1) * size >= active.length,
  });
});

// ── 추천 여행 목록 ────────────────────────────────────────────────────────
// GET /api/travels/recommend
router.get('/travels/recommend', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 5;
  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;

  const active = [...db.trips.values()]
    .filter((t) => t.status === 'IN_PROGRESS')
    .sort((a, b) => b.viewCount - a.viewCount);

  const paginated = active.slice(page * size, (page + 1) * size);
  return ok(res, {
    content: paginated.map((t) => formatTrip(t, user?.userNumber)),
    totalElements: active.length,
    totalPages: Math.ceil(active.length / size),
    number: page,
    size,
    last: (page + 1) * size >= active.length,
  });
});

// ── 여행 수정 ─────────────────────────────────────────────────────────────
// PUT /api/travel/:travelNumber
router.put('/travel/:travelNumber', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const travelNumber = parseInt(req.params.travelNumber);
  const trip = db.trips.get(travelNumber);
  if (!trip) return fail(res, '존재하지 않는 여행입니다.', 404);
  if (trip.userNumber !== user.userNumber) return fail(res, '권한이 없습니다.', 403);

  Object.assign(trip, {
    title: req.body.title ?? trip.title,
    details: req.body.details ?? trip.details,
    locationName: req.body.locationName ?? trip.locationName,
    startDate: req.body.startDate ?? trip.startDate,
    endDate: req.body.endDate ?? trip.endDate,
    maxPerson: req.body.maxPerson ?? trip.maxPerson,
    genderType: req.body.genderType ?? trip.genderType,
    periodType: req.body.periodType ?? trip.periodType,
    tags: req.body.tags ?? trip.tags,
  });

  return ok(res, { travelNumber });
});

// ── 여행 삭제 ─────────────────────────────────────────────────────────────
// DELETE /api/travel/:travelNumber
router.delete('/travel/:travelNumber', (req: Request, res: Response) => {
  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const travelNumber = parseInt(req.params.travelNumber);
  const trip = db.trips.get(travelNumber);
  if (!trip) return fail(res, '존재하지 않는 여행입니다.', 404);
  if (trip.userNumber !== user.userNumber) return fail(res, '권한이 없습니다.', 403);

  trip.status = 'DELETED';
  return ok(res, true);
});

// ── 검색 ─────────────────────────────────────────────────────────────────
// GET /api/travels/search
router.get('/travels/search', (req: Request, res: Response) => {
  const keyword = (req.query.keyword as string) || '';
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 5;
  const token = getBearerToken(req);
  const user = token ? db.getUserByToken(token) : null;

  const results = [...db.trips.values()].filter(
    (t) =>
      t.status === 'IN_PROGRESS' &&
      (t.title.includes(keyword) || t.locationName.includes(keyword) || t.tags.some((tag) => tag.includes(keyword)))
  );

  const paginated = results.slice(page * size, (page + 1) * size);
  return ok(res, {
    content: paginated.map((t) => formatTrip(t, user?.userNumber)),
    totalElements: results.length,
    totalPages: Math.ceil(results.length / size),
    number: page,
    size,
    last: (page + 1) * size >= results.length,
  });
});

// ── 자동완성 ──────────────────────────────────────────────────────────────
// GET /api/autocomplete
router.get('/autocomplete', (req: Request, res: Response) => {
  const keyword = (req.query.keyword as string) || '';
  const suggestions = [...db.trips.values()]
    .filter((t) => t.status === 'IN_PROGRESS' && t.title.includes(keyword))
    .slice(0, 5)
    .map((t) => t.title);
  return ok(res, suggestions);
});

// ── 참가자 목록 ───────────────────────────────────────────────────────────
// GET /api/travel/:travelNumber/companions
router.get('/travel/:travelNumber/companions', (req: Request, res: Response) => {
  const travelNumber = parseInt(req.params.travelNumber);
  const trip = db.trips.get(travelNumber);
  if (!trip) return fail(res, '존재하지 않는 여행입니다.', 404);

  const companions = db.getEnrollmentsByTravel(travelNumber)
    .filter((e) => e.status === 'ACCEPTED')
    .map((e) => {
      const u = db.users.get(e.userNumber);
      return { userNumber: e.userNumber, name: u?.name || '', profileImageUrl: u?.profileImageUrl || null };
    });

  return ok(res, companions);
});

// ── 참가 신청 수 ──────────────────────────────────────────────────────────
// GET /api/travel/:travelNumber/enrollmentCount
router.get('/travel/:travelNumber/enrollmentCount', (req: Request, res: Response) => {
  const travelNumber = parseInt(req.params.travelNumber);
  const count = db.getEnrollmentsByTravel(travelNumber).filter((e) => e.status === 'PENDING').length;
  return ok(res, { count });
});

export default router;
