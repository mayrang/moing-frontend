import db, { CommunityPost } from '@/mocks/db/store';
import { ok, fail, getToken } from '../../_lib/helpers';

const formatPost = (post: CommunityPost, userNumber?: number) => {
  const author = db.users.get(post.userNumber);
  return {
    postNumber: post.communityNumber,
    userNumber: post.userNumber,
    postWriter: author?.name || '',
    profileImageUrl: author?.profileImageUrl || null,
    categoryNumber: post.categoryNumber,
    categoryName: post.categoryName,
    title: post.title,
    content: post.content,
    regDate: post.createdAt,
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    commentCount: db.getCommentsByRelated('COMMUNITY', post.communityNumber).length,
    liked: userNumber ? post.likedBy.includes(userNumber) : false,
    thumbnailUrl: post.images[0]?.url || '',
  };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');
  const keyword = url.searchParams.get('keyword') ?? '';
  const categoryName = url.searchParams.get('categoryName') ?? '';
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;

  let posts = [...db.communityPosts.values()].filter((p) => !p.deleted);
  if (keyword) posts = posts.filter((p) => p.title.includes(keyword) || p.content.includes(keyword));
  if (categoryName && categoryName !== '전체') posts = posts.filter((p) => p.categoryName === categoryName);
  posts = posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const paginated = posts.slice(page * size, (page + 1) * size);
  return ok({
    content: paginated.map((p) => formatPost(p, user?.userNumber)),
    page: {
      size,
      number: page,
      totalElements: posts.length,
      totalPages: Math.ceil(posts.length / size),
    },
  });
}

export async function POST(request: Request) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { title, content, categoryName } = await request.json();
  const communityNumber = db.nextCommunityId();
  const post: CommunityPost = {
    communityNumber,
    userNumber: user.userNumber,
    title,
    content,
    categoryNumber: 0,
    categoryName,
    viewCount: 0,
    likeCount: 0,
    likedBy: [],
    commentCount: 0,
    images: [],
    deleted: false,
    createdAt: db.now(),
  };
  db.communityPosts.set(communityNumber, post);
  return ok({ postNumber: communityNumber });
}
