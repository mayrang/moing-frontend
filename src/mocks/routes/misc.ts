/**
 * bookmark, enrollment, comment, notification, myPage, userProfile, myTrip 라우트
 */
import { Router, Request, Response } from 'express';
import db, { Enrollment, Comment, Notification } from '../db/store';

const router = Router();

const ok = (res: Response, success: unknown) =>
  res.json({ resultType: 'SUCCESS', success, error: null });
const fail = (res: Response, reason: string, status = 400) =>
  res.status(status).json({ resultType: 'FAIL', success: null, error: { reason } });
const getToken = (req: Request) => {
  const auth = req.headers.authorization;
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
};

// ── Bookmark ──────────────────────────────────────────────────────────────

// GET /api/bookmarks
router.get('/bookmarks', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 5;

  const bookmarks = [...db.bookmarks.values()].filter((b) => b.userNumber === user.userNumber);
  const paginated = bookmarks.slice(page * size, (page + 1) * size);

  const content = paginated.map((b) => {
    const trip = db.trips.get(b.travelNumber);
    return trip ? { travelNumber: trip.travelNumber, title: trip.title, locationName: trip.locationName } : null;
  }).filter(Boolean);

  return ok(res, { content, totalElements: bookmarks.length, number: page, size });
});

// POST /api/bookmarks
router.post('/bookmarks', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const { travelNumber } = req.body;
  const key = db.getBookmarkKey(user.userNumber, travelNumber);
  db.bookmarks.set(key, { userNumber: user.userNumber, travelNumber, createdAt: db.now() });
  return ok(res, true);
});

// DELETE /api/bookmarks/:travelNumber
router.delete('/bookmarks/:travelNumber', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const travelNumber = parseInt(req.params.travelNumber);
  const key = db.getBookmarkKey(user.userNumber, travelNumber);
  db.bookmarks.delete(key);
  return ok(res, true);
});

// ── Enrollment ────────────────────────────────────────────────────────────

// POST /api/enrollment
router.post('/enrollment', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const { travelNumber, message } = req.body;
  const enrollmentNumber = db.nextEnrollmentId();
  const enrollment: Enrollment = {
    enrollmentNumber,
    travelNumber,
    userNumber: user.userNumber,
    status: 'PENDING',
    createdAt: db.now(),
  };
  db.enrollments.set(enrollmentNumber, enrollment);
  return ok(res, { enrollmentNumber });
});

// DELETE /api/enrollment/:enrollmentNumber
router.delete('/enrollment/:enrollmentNumber', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const enrollmentNumber = parseInt(req.params.enrollmentNumber);
  db.enrollments.delete(enrollmentNumber);
  return ok(res, true);
});

// GET /api/travel/:travelNumber/enrollments
router.get('/travel/:travelNumber/enrollments', (req: Request, res: Response) => {
  const travelNumber = parseInt(req.params.travelNumber);
  const enrollments = db.getEnrollmentsByTravel(travelNumber)
    .filter((e) => e.status === 'PENDING')
    .map((e) => {
      const u = db.users.get(e.userNumber);
      return {
        enrollmentNumber: e.enrollmentNumber,
        userName: u?.name || '',
        userAgeGroup: u?.ageGroup || '',
        enrolledAt: e.createdAt,
        message: '',
        status: e.status,
        profileUrl: u?.profileImageUrl || null,
      };
    });
  return ok(res, { enrollments, totalCount: enrollments.length });
});

// GET /api/travel/:travelNumber/enrollments/last-viewed
router.get('/travel/:travelNumber/enrollments/last-viewed', (req: Request, res: Response) => {
  return ok(res, { lastViewedAt: null });
});

// PUT /api/travel/:travelNumber/enrollments/last-viewed
router.put('/travel/:travelNumber/enrollments/last-viewed', (req: Request, res: Response) => {
  return ok(res, true);
});

// PUT /api/enrollment/:enrollmentNumber/acceptance
router.put('/enrollment/:enrollmentNumber/acceptance', (req: Request, res: Response) => {
  const enrollmentNumber = parseInt(req.params.enrollmentNumber);
  const enrollment = db.enrollments.get(enrollmentNumber);
  if (!enrollment) return fail(res, '존재하지 않는 신청입니다.', 404);
  enrollment.status = 'ACCEPTED';
  return ok(res, true);
});

// PUT /api/enrollment/:enrollmentNumber/rejection
router.put('/enrollment/:enrollmentNumber/rejection', (req: Request, res: Response) => {
  const enrollmentNumber = parseInt(req.params.enrollmentNumber);
  const enrollment = db.enrollments.get(enrollmentNumber);
  if (!enrollment) return fail(res, '존재하지 않는 신청입니다.', 404);
  enrollment.status = 'REJECTED';
  return ok(res, true);
});

// ── Comment ───────────────────────────────────────────────────────────────

// GET /api/:relatedType/:relatedNumber/comments
router.get('/:relatedType/:relatedNumber/comments', (req: Request, res: Response) => {
  const { relatedType, relatedNumber } = req.params;
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 5;

  const comments = db.getCommentsByRelated(relatedType.toUpperCase(), parseInt(relatedNumber))
    .map((c) => {
      const u = db.users.get(c.userNumber);
      return { ...c, userName: u?.name || '', userProfileImage: u?.profileImageUrl || null };
    });

  const paginated = comments.slice(page * size, (page + 1) * size);
  return ok(res, { content: paginated, totalElements: comments.length, number: page, size });
});

// POST /api/:relatedType/:relatedNumber/comments
router.post('/:relatedType/:relatedNumber/comments', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const { relatedType, relatedNumber } = req.params;
  const { content, parentNumber } = req.body;
  const commentNumber = db.nextCommentId();
  const comment: Comment = {
    commentNumber,
    relatedType: relatedType.toUpperCase() as 'TRAVEL' | 'COMMUNITY',
    relatedNumber: parseInt(relatedNumber),
    userNumber: user.userNumber,
    content,
    parentNumber: parentNumber || null,
    likeCount: 0,
    createdAt: db.now(),
  };
  db.comments.set(commentNumber, comment);

  // 게시글 댓글 수 증가
  const post = db.communityPosts.get(parseInt(relatedNumber));
  if (post && relatedType.toUpperCase() === 'COMMUNITY') post.commentCount += 1;

  return ok(res, { commentNumber });
});

// PUT /api/comments/:commentNumber
router.put('/comments/:commentNumber', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const commentNumber = parseInt(req.params.commentNumber);
  const comment = db.comments.get(commentNumber);
  if (!comment) return fail(res, '존재하지 않는 댓글입니다.', 404);
  if (comment.userNumber !== user.userNumber) return fail(res, '권한이 없습니다.', 403);

  comment.content = req.body.content ?? comment.content;
  return ok(res, true);
});

// DELETE /api/comments/:commentNumber
router.delete('/comments/:commentNumber', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const commentNumber = parseInt(req.params.commentNumber);
  db.comments.delete(commentNumber);
  return ok(res, true);
});

// POST /api/comment/:commentNumber/like
router.post('/comment/:commentNumber/like', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const commentNumber = parseInt(req.params.commentNumber);
  const comment = db.comments.get(commentNumber);
  if (!comment) return fail(res, '존재하지 않는 댓글입니다.', 404);

  const key = `${user.userNumber}-${commentNumber}`;
  if (db.commentLikes.has(key)) {
    db.commentLikes.delete(key);
    comment.likeCount = Math.max(0, comment.likeCount - 1);
    return ok(res, { liked: false, likeCount: comment.likeCount });
  }
  db.commentLikes.add(key);
  comment.likeCount += 1;
  return ok(res, { liked: true, likeCount: comment.likeCount });
});

// ── Notification ──────────────────────────────────────────────────────────

// GET /api/notifications
router.get('/notifications', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const notifications = [...db.notifications.values()].filter((n) => n.userNumber === user.userNumber);
  const paginated = notifications.slice(page * size, (page + 1) * size);
  return ok(res, {
    content: paginated,
    page: { size, number: page, totalElements: notifications.length, totalPages: Math.ceil(notifications.length / size) || 1 },
  });
});

// ── MyPage (Profile) ──────────────────────────────────────────────────────

// GET /api/profile/me
router.get('/profile/me', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  return ok(res, {
    userNumber: user.userNumber,
    name: user.name,
    email: user.email,
    ageGroup: user.ageGroup,
    gender: user.gender,
    preferredTags: user.preferredTags,
    introduction: user.introduction,
    profileImageUrl: user.profileImageUrl,
  });
});

// PUT /api/profile/me  (프론트엔드 경로, 실제 백엔드는 /api/profile/update)
router.put('/profile/me', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  Object.assign(user, {
    name: req.body.name ?? user.name,
    introduction: req.body.introduction ?? user.introduction,
    preferredTags: req.body.preferredTags ?? user.preferredTags,
  });
  return ok(res, true);
});

// PUT /api/profile/update  (실제 백엔드 경로)
router.put('/profile/update', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  Object.assign(user, {
    name: req.body.name ?? user.name,
    introduction: req.body.introduction ?? user.introduction,
    preferredTags: req.body.preferredTags ?? user.preferredTags,
  });
  return ok(res, true);
});

// POST /api/profile/image
router.post('/profile/image', (req: Request, res: Response) => {
  return ok(res, { imageUrl: 'https://placehold.co/100x100' });
});

// GET /api/profile/image
router.get('/profile/image', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  return ok(res, { imageUrl: user?.profileImageUrl || null });
});

// POST /api/auth/verify-password
router.post('/auth/verify-password', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const { password } = req.body;
  if (user.password !== password) return fail(res, '비밀번호가 올바르지 않습니다.', 401);
  return ok(res, true);
});

// ── MyTrip ────────────────────────────────────────────────────────────────

// GET /api/my-travels  (내가 만든 여행)
router.get('/my-travels', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const trips = db.getTripsByUser(user.userNumber).map((t) => ({
    travelNumber: t.travelNumber,
    title: t.title,
    locationName: t.locationName,
    startDate: t.startDate,
    endDate: t.endDate,
    status: t.status,
  }));
  return ok(res, trips);
});

// GET /api/my-applied-travels  (내가 신청한 여행)
router.get('/my-applied-travels', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const enrollments = [...db.enrollments.values()].filter((e) => e.userNumber === user.userNumber);
  const result = enrollments.map((e) => {
    const trip = db.trips.get(e.travelNumber);
    return { enrollmentNumber: e.enrollmentNumber, status: e.status, trip };
  });
  return ok(res, result);
});

// DELETE /api/my-applied-travels/:travelNumber/cancel
router.delete('/my-applied-travels/:travelNumber/cancel', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const travelNumber = parseInt(req.params.travelNumber);
  const enrollment = [...db.enrollments.values()].find(
    (e) => e.travelNumber === travelNumber && e.userNumber === user.userNumber
  );
  if (enrollment) db.enrollments.delete(enrollment.enrollmentNumber);
  return ok(res, true);
});

// GET /api/my-requested-travels  (내 여행에 신청온 것)
router.get('/my-requested-travels', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const myTrips = db.getTripsByUser(user.userNumber).map((t) => t.travelNumber);
  const enrollments = [...db.enrollments.values()]
    .filter((e) => myTrips.includes(e.travelNumber) && e.status === 'PENDING');
  return ok(res, enrollments);
});

// DELETE /api/my-requested-travels/:travelNumber/cancel
router.delete('/my-requested-travels/:travelNumber/cancel', (req: Request, res: Response) => {
  return ok(res, true);
});

// ── UserProfile ───────────────────────────────────────────────────────────

// GET /api/users/:userNumber/profile
router.get('/users/:userNumber/profile', (req: Request, res: Response) => {
  const userNumber = parseInt(req.params.userNumber);
  const user = db.users.get(userNumber);
  if (!user) return fail(res, '사용자를 찾을 수 없습니다.', 404);

  return ok(res, {
    userNumber: user.userNumber,
    name: user.name,
    ageGroup: user.ageGroup,
    gender: user.gender,
    preferredTags: user.preferredTags,
    introduction: user.introduction,
    profileImageUrl: user.profileImageUrl,
  });
});

// GET /api/users/:userNumber/created-travels
router.get('/users/:userNumber/created-travels', (req: Request, res: Response) => {
  const userNumber = parseInt(req.params.userNumber);
  const trips = db.getTripsByUser(userNumber).map((t) => ({
    travelNumber: t.travelNumber,
    title: t.title,
    locationName: t.locationName,
    startDate: t.startDate,
    endDate: t.endDate,
    status: t.status,
  }));
  return ok(res, trips);
});

// GET /api/users/:userNumber/applied-travels
router.get('/users/:userNumber/applied-travels', (req: Request, res: Response) => {
  const userNumber = parseInt(req.params.userNumber);
  const enrollments = [...db.enrollments.values()]
    .filter((e) => e.userNumber === userNumber && e.status === 'ACCEPTED')
    .map((e) => {
      const trip = db.trips.get(e.travelNumber);
      return { travelNumber: e.travelNumber, title: trip?.title || '', locationName: trip?.locationName || '' };
    });
  return ok(res, enrollments);
});

// GET /api/users/:userNumber/visited-countries
router.get('/users/:userNumber/visited-countries', (req: Request, res: Response) => {
  return ok(res, { countries: [] });
});

// GET /api/user/:userId  (단일 유저 조회)
router.get('/user/:userId', (req: Request, res: Response) => {
  const userNumber = parseInt(req.params.userId);
  const user = db.users.get(userNumber);
  if (!user) return fail(res, '사용자를 찾을 수 없습니다.', 404);
  return ok(res, { userNumber: user.userNumber, name: user.name, profileImageUrl: user.profileImageUrl });
});

export default router;
