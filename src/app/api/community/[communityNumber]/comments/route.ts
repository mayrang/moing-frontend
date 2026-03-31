import db, { Comment } from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ communityNumber: string }> },
) {
  const { communityNumber } = await params;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '0');
  const size = parseInt(url.searchParams.get('size') ?? '5');

  const comments = db
    .getCommentsByRelated('COMMUNITY', parseInt(communityNumber))
    .map((c) => {
      const u = db.users.get(c.userNumber);
      return { ...c, userName: u?.name || '', userProfileImage: u?.profileImageUrl || null };
    });

  const paginated = comments.slice(page * size, (page + 1) * size);
  return ok({ content: paginated, totalElements: comments.length, number: page, size });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ communityNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { communityNumber } = await params;
  const { content, parentNumber } = await request.json();
  const commentNumber = db.nextCommentId();
  const comment: Comment = {
    commentNumber,
    relatedType: 'COMMUNITY',
    relatedNumber: parseInt(communityNumber),
    userNumber: user.userNumber,
    content,
    parentNumber: parentNumber || null,
    likeCount: 0,
    createdAt: db.now(),
  };
  db.comments.set(commentNumber, comment);
  return ok({ commentNumber });
}
