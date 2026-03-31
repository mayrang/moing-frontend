import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../_lib/helpers';

export async function GET(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');

  const posts = [...db.communityPosts.values()]
    .filter((p) => !p.deleted && p.userNumber === user.userNumber)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = posts.slice(page * size, (page + 1) * size).map((p) => ({
    communityNumber: p.communityNumber,
    title: p.title,
    content: p.content,
    categoryName: p.categoryName,
    likeCount: p.likeCount,
    commentCount: db.getCommentsByRelated('COMMUNITY', p.communityNumber).length,
    liked: p.likedBy.includes(user.userNumber),
    createdAt: p.createdAt,
    images: p.images,
  }));

  return ok({
    content: paginated,
    page: {
      size,
      number: page,
      totalElements: posts.length,
      totalPages: Math.ceil(posts.length / size),
    },
  });
}
