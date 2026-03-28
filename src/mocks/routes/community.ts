import { Router, Request, Response } from 'express';
import db, { CommunityPost } from '../db/store';

const router = Router();

const ok = (res: Response, success: unknown) =>
  res.json({ resultType: 'SUCCESS', success, error: null });
const fail = (res: Response, reason: string, status = 400) =>
  res.status(status).json({ resultType: 'FAIL', success: null, error: { reason } });
const getToken = (req: Request) => {
  const auth = req.headers.authorization;
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
};

const formatPost = (post: CommunityPost, userNumber?: number) => {
  const user = db.users.get(post.userNumber);
  return {
    communityNumber: post.communityNumber,
    userNumber: post.userNumber,
    userName: user?.name || '',
    userProfileImage: user?.profileImageUrl || null,
    title: post.title,
    content: post.content,
    categoryNumber: post.categoryNumber,
    categoryName: post.categoryName,
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    createdAt: post.createdAt,
    isLiked: userNumber ? db.communityLikes.has(`${userNumber}-${post.communityNumber}`) : false,
  };
};

// GET /api/community/posts
router.get('/community/posts', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 5;
  const keyword = req.query.keyword as string;
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;

  let posts = [...db.communityPosts.values()];
  if (keyword) {
    posts = posts.filter((p) => p.title.includes(keyword) || p.content.includes(keyword));
  }
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = posts.slice(page * size, (page + 1) * size);
  return ok(res, {
    content: paginated.map((p) => formatPost(p, user?.userNumber)),
    totalElements: posts.length,
    totalPages: Math.ceil(posts.length / size),
    number: page,
    size,
  });
});

// GET /api/my-communities
router.get('/my-communities', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const mine = [...db.communityPosts.values()].filter((p) => p.userNumber === user.userNumber);
  return ok(res, mine.map((p) => formatPost(p, user.userNumber)));
});

// GET /api/community/posts/:communityNumber
router.get('/community/posts/:communityNumber', (req: Request, res: Response) => {
  const communityNumber = parseInt(req.params.communityNumber);
  const post = db.communityPosts.get(communityNumber);
  if (!post) return fail(res, '존재하지 않는 게시글입니다.', 404);

  post.viewCount += 1;
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  return ok(res, formatPost(post, user?.userNumber));
});

// POST /api/community/posts
router.post('/community/posts', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const { title, content, categoryNumber, categoryName } = req.body;
  const communityNumber = db.nextCommunityId();
  const post: CommunityPost = {
    communityNumber,
    userNumber: user.userNumber,
    title,
    content,
    categoryNumber: categoryNumber || 1,
    categoryName: categoryName || '여행 정보',
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: db.now(),
    images: [],
  };
  db.communityPosts.set(communityNumber, post);
  return ok(res, { communityNumber });
});

// PUT /api/community/posts/:communityNumber
router.put('/community/posts/:communityNumber', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const communityNumber = parseInt(req.params.communityNumber);
  const post = db.communityPosts.get(communityNumber);
  if (!post) return fail(res, '존재하지 않는 게시글입니다.', 404);
  if (post.userNumber !== user.userNumber) return fail(res, '권한이 없습니다.', 403);

  Object.assign(post, {
    title: req.body.title ?? post.title,
    content: req.body.content ?? post.content,
  });
  return ok(res, { communityNumber });
});

// DELETE /api/community/posts/:communityNumber
router.delete('/community/posts/:communityNumber', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const communityNumber = parseInt(req.params.communityNumber);
  const post = db.communityPosts.get(communityNumber);
  if (!post) return fail(res, '존재하지 않는 게시글입니다.', 404);
  if (post.userNumber !== user.userNumber) return fail(res, '권한이 없습니다.', 403);

  db.communityPosts.delete(communityNumber);
  return ok(res, true);
});

// POST /api/community/:communityNumber/like  (토글)
router.post('/community/:communityNumber/like', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const communityNumber = parseInt(req.params.communityNumber);
  const post = db.communityPosts.get(communityNumber);
  if (!post) return fail(res, '존재하지 않는 게시글입니다.', 404);

  const key = `${user.userNumber}-${communityNumber}`;
  if (db.communityLikes.has(key)) {
    db.communityLikes.delete(key);
    post.likeCount = Math.max(0, post.likeCount - 1);
    return ok(res, { liked: false, likeCount: post.likeCount });
  }
  db.communityLikes.add(key);
  post.likeCount += 1;
  return ok(res, { liked: true, likeCount: post.likeCount });
});

// DELETE /api/community/:communityNumber/like
router.delete('/community/:communityNumber/like', (req: Request, res: Response) => {
  const token = getToken(req);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail(res, '인증이 필요합니다.', 401);

  const communityNumber = parseInt(req.params.communityNumber);
  const post = db.communityPosts.get(communityNumber);
  if (!post) return fail(res, '존재하지 않는 게시글입니다.', 404);

  const key = `${user.userNumber}-${communityNumber}`;
  db.communityLikes.delete(key);
  post.likeCount = Math.max(0, post.likeCount - 1);
  return ok(res, { liked: false, likeCount: post.likeCount });
});

// GET /api/community/:communityNumber/images
router.get('/community/:communityNumber/images', (req: Request, res: Response) => {
  const communityNumber = parseInt(req.params.communityNumber);
  const post = db.communityPosts.get(communityNumber);
  return ok(res, post?.images || []);
});

// POST /api/community/:communityNumber/images
router.post('/community/:communityNumber/images', (req: Request, res: Response) => {
  return ok(res, { imageUrl: 'https://placehold.co/400x300' });
});

// PUT /api/community/:communityNumber/images
router.put('/community/:communityNumber/images', (req: Request, res: Response) => {
  return ok(res, { imageUrl: 'https://placehold.co/400x300' });
});

export default router;
