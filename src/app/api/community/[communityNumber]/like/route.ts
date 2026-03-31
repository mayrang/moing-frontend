import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ communityNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { communityNumber } = await params;
  const post = db.communityPosts.get(parseInt(communityNumber));
  if (!post) return fail('존재하지 않는 게시글입니다.', 404);

  const liked = post.likedBy.includes(user.userNumber);
  if (liked) {
    post.likedBy = post.likedBy.filter((n) => n !== user.userNumber);
    post.likeCount -= 1;
  } else {
    post.likedBy.push(user.userNumber);
    post.likeCount += 1;
  }
  return ok({ liked: !liked, likeCount: post.likeCount });
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

  post.likedBy = post.likedBy.filter((n) => n !== user.userNumber);
  post.likeCount = Math.max(0, post.likeCount - 1);
  return ok(null);
}
