import db from '@/mocks/db/store';
import { ok, fail, getToken } from '../../../_lib/helpers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ communityNumber: string }> },
) {
  const { communityNumber } = await params;
  const post = db.communityPosts.get(parseInt(communityNumber));
  if (!post) return fail('존재하지 않는 게시글입니다.', 404);

  const images = post.images.map((url, idx) => ({ imageNumber: idx + 1, url }));
  return ok(images);
}

// CREATE 및 EDIT 모두 동일한 형식: { urls: string[] }
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

  const { urls } = await request.json();
  post.images = urls ?? [];
  return ok(null);
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
  if (!post) return fail('존재하지 않는 게시글입니다.', 404);
  if (post.userNumber !== user.userNumber) return fail('권한이 없습니다.', 403);

  const { urls } = await request.json();
  post.images = urls ?? [];
  return ok(null);
}
