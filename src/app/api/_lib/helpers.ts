import { NextResponse } from 'next/server';

export const ok = (data: unknown) =>
  NextResponse.json({ resultType: 'SUCCESS', success: data, error: null });

export const fail = (reason: string, status = 400) =>
  NextResponse.json({ resultType: 'FAIL', success: null, error: { reason } }, { status });

export const getToken = (request: Request): string | null => {
  const auth = request.headers.get('authorization');
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null;
};
