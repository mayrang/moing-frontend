import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '@/mocks/db/store';
import { ok, getToken } from '../_lib/helpers';

export async function POST(request: Request) {
  const token = getToken(request);
  if (token) db.sessions.delete(token);

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (refreshToken) db.refreshTokens.delete(refreshToken);

  const response = ok(true);
  response.cookies.delete('refreshToken');
  return response;
}
