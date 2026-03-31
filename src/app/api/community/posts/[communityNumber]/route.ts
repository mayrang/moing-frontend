import db, { CommunityPost } from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

const formatPost = (post: CommunityPost, userNumber?: number) => {
  const author = db.users.get(post.userNumber);
  return {
    communityNumber: post.communityNumber,
    userNumber: post.userNumber,
    userName: author?.name || '',
    profileUrl: author?.profileImageUrl || null,
    title: post.title,
    content: post.content,
    categoryName: post.categoryName,
    likeCount: post.likeCount,
    commentCount: db.getCommentsByRelated('COMMUNITY', post.communityNumber).length,
    liked: userNumber ? post.likedBy.includes(userNumber) : false,
    createdAt: post.createdAt,
    images: post.images,
  };
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ communityNumber: string }> },
) {
  const { communityNumber } = await params;
  const post = db.communityPosts.get(parseInt(communityNumber));
  if (!post || post.deleted) return fail('존재하지 않는 게시글입니다.', 404);

  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  return ok(formatPost(post, user?.userNumber));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ communityNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { communityNumber } = await params;
  const post = db.communityPosts.get(parseInt(communityNumber));
  if (!post || post.deleted) return fail('존재하지 않는 게시글입니다.', 404);
  if (post.userNumber !== user.userNumber) return fail('권한이 없습니다.', 403);

  const { title, content, categoryName } = await request.json();
  Object.assign(post, {
    title: title ?? post.title,
    content: content ?? post.content,
    categoryName: categoryName ?? post.categoryName,
  });
  return ok({ communityNumber: post.communityNumber });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ communityNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { communityNumber } = await params;
  const post = db.communityPosts.get(parseInt(communityNumber));
  if (!post) return fail('존재하지 않는 게시글입니다.', 404);
  if (post.userNumber !== user.userNumber) return fail('권한이 없습니다.', 403);

  post.deleted = true;
  return ok(true);
}
