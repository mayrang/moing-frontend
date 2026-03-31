import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentNumber: string }> },
) {
  const token = getToken(request);
  const user = token ? db.getUserByToken(token) : null;
  if (!user) return fail('인증이 필요합니다.', 401);

  const { commentNumber } = await params;
  const comment = db.comments.get(parseInt(commentNumber));
  if (!comment) return fail('존재하지 않는 댓글입니다.', 404);

  comment.likeCount += 1;
  return ok({ likeCount: comment.likeCount });
}
